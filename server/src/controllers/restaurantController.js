/**
 * ============================================================
 * RESTAURANT CONTROLLER
 * ============================================================
 * Public: list, detail, menu item, areas
 * Admin:  CRUD for restaurants and menu items
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import { parsePagination } from "../utils/helpers.js";

/* ============================================================
   PUBLIC — LIST RESTAURANTS
   ============================================================ */
export const listRestaurants = asyncHandler(async (req, res) => {
  const { city, area, cuisine, search } = req.query;
  const { page, limit, skip } = parsePagination(req.query, 50);

  const filter = { isActive: true };

  if (city) {
    filter["address.city"] = new RegExp(`^${city}$`, "i");
  }
  if (cuisine) {
    filter.cuisines = { $in: [new RegExp(`^${cuisine}$`, "i")] };
  }

  const areaClauses = [];
  if (area) {
    const areaRegex = new RegExp(area, "i");
    areaClauses.push(
      { "address.line1": areaRegex },
      { "address.line2": areaRegex },
      { "address.city": areaRegex },
    );
  }

  const searchClauses = [];
  if (search) {
    const searchRegex = new RegExp(search, "i");
    searchClauses.push(
      { name: searchRegex },
      { description: searchRegex },
      { cuisines: searchRegex },
    );
  }

  const ands = [];
  if (areaClauses.length) ands.push({ $or: areaClauses });
  if (searchClauses.length) ands.push({ $or: searchClauses });
  if (ands.length) filter.$and = ands;

  const [total, restaurants] = await Promise.all([
    Restaurant.countDocuments(filter),
    Restaurant.find(filter).sort("-isFeatured -rating").skip(skip).limit(limit),
  ]);

  res.json({
    restaurants,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

/* ============================================================
   PUBLIC — GET SINGLE RESTAURANT WITH MENU
   ============================================================ */
export const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const menu = await MenuItem.find({
    restaurant: restaurant._id,
    isAvailable: true,
  }).sort("category order name");

  const grouped = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  res.json({ restaurant, menu, grouped });
});

/* ============================================================
   PUBLIC — LIST DISTINCT AREAS
   ============================================================ */
export const listAreas = asyncHandler(async (req, res) => {
  const { city } = req.query;

  if (!city) {
    res.status(400);
    throw new Error("city query param is required");
  }

  const restaurants = await Restaurant.find({
    isActive: true,
    "address.city": new RegExp(`^${city}$`, "i"),
  }).select("address.line1 address.line2");

  const areaSet = new Set();

  restaurants.forEach((r) => {
    const line1 = (r.address?.line1 || "").trim();
    const line2 = (r.address?.line2 || "").trim();

    if (line2) areaSet.add(line2);

    if (line1) {
      const parts = line1.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) areaSet.add(parts.slice(0, 2).join(" "));
      if (parts.length >= 1 && parts[0].length > 2) areaSet.add(parts[0]);
    }
  });

  res.json({
    city,
    areas: Array.from(areaSet).sort(),
  });
});

/* ============================================================
   PUBLIC — GET SINGLE MENU ITEM
   ============================================================ */
export const getMenuItemById = asyncHandler(async (req, res) => {
  const { rid, itemId } = req.params;

  const item = await MenuItem.findOne({
    _id: itemId,
    restaurant: rid,
  }).populate("restaurant");

  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  const siblings = await MenuItem.find({
    restaurant: rid,
    category: item.category,
    _id: { $ne: item._id },
    isAvailable: true,
  })
    .limit(6)
    .sort("order name");

  res.json({ item, restaurant: item.restaurant, siblings });
});

/* ============================================================
   ADMIN — LIST ALL RESTAURANTS (including inactive)
   ============================================================ */
export const listAllRestaurantsAdmin = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().sort("-createdAt");

  const withCounts = await Promise.all(
    restaurants.map(async (r) => {
      const itemCount = await MenuItem.countDocuments({ restaurant: r._id });
      return {
        ...r.toObject(),
        itemCount,
        reviews: r.reviewCount ? `${(r.reviewCount / 1000).toFixed(1)}K` : "0",
      };
    }),
  );

  res.json({ restaurants: withCounts, total: withCounts.length });
});

/* ============================================================
   ADMIN — CREATE RESTAURANT
   ============================================================ */
export const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    cuisines,
    address,
    phone,
    rating,
    deliveryTime,
    priceForTwo,
    offer,
    isVeg,
    isActive,
    isFeatured,
  } = req.body;

  if (
    !name ||
    !image ||
    !cuisines?.length ||
    !address?.line1 ||
    !address?.city ||
    !address?.pincode
  ) {
    res.status(400);
    throw new Error("Name, image, cuisines and full address are required");
  }

  const restaurant = await Restaurant.create({
    name: name.trim(),
    description: description?.trim() || "",
    image,
    cuisines: cuisines.map((c) => String(c).trim()).filter(Boolean),
    address: {
      line1: address.line1.trim(),
      line2: address.line2?.trim() || "",
      city: address.city.trim(),
      pincode: address.pincode.trim(),
    },
    phone: phone?.trim() || "",
    rating: rating || 4.5,
    deliveryTime: deliveryTime || 30,
    priceForTwo: priceForTwo || 400,
    offer: offer?.trim() || "",
    isVeg: !!isVeg,
    isActive: isActive !== false,
    isFeatured: !!isFeatured,
  });

  res
    .status(201)
    .json({ ...restaurant.toObject(), itemCount: 0, reviews: "0" });
});

/* ============================================================
   ADMIN — UPDATE RESTAURANT
   ============================================================ */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const fields = [
    "name",
    "description",
    "image",
    "cuisines",
    "phone",
    "rating",
    "deliveryTime",
    "priceForTwo",
    "offer",
    "isVeg",
    "isActive",
    "isFeatured",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) restaurant[f] = req.body[f];
  });

  if (req.body.address) {
    Object.assign(restaurant.address, req.body.address);
  }

  await restaurant.save();

  const itemCount = await MenuItem.countDocuments({
    restaurant: restaurant._id,
  });

  res.json({ ...restaurant.toObject(), itemCount });
});

/* ============================================================
   ADMIN — TOGGLE ACTIVE
   ============================================================ */
export const toggleRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();

  const itemCount = await MenuItem.countDocuments({
    restaurant: restaurant._id,
  });

  res.json({ ...restaurant.toObject(), itemCount });
});

/* ============================================================
   ADMIN — DELETE RESTAURANT (cascade menu)
   ============================================================ */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  await MenuItem.deleteMany({ restaurant: restaurant._id });
  await restaurant.deleteOne();

  res.json({ message: "Restaurant and menu deleted", _id: req.params.id });
});

/* ============================================================
   ADMIN — CREATE MENU ITEM
   ============================================================ */
export const createMenuItem = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const {
    name,
    description,
    image,
    price,
    mrp,
    category,
    isVeg,
    isAvailable,
    isRecommended,
    order,
  } = req.body;

  if (!name?.trim() || price === undefined) {
    res.status(400);
    throw new Error("Name and price are required");
  }

  const item = await MenuItem.create({
    restaurant: restaurant._id,
    name: name.trim(),
    description: description?.trim() || "",
    image: image || restaurant.image,
    price: Number(price),
    mrp: Number(mrp) || 0,
    category: category?.trim() || "Recommended",
    isVeg: !!isVeg,
    isAvailable: isAvailable !== false,
    isRecommended: !!isRecommended,
    order: Number(order) || 0,
  });

  res.status(201).json(item);
});

/* ============================================================
   ADMIN — UPDATE MENU ITEM
   ============================================================ */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  const fields = [
    "name",
    "description",
    "image",
    "price",
    "mrp",
    "category",
    "isVeg",
    "isAvailable",
    "isRecommended",
    "order",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  });

  await item.save();
  res.json(item);
});

/* ============================================================
   ADMIN — DELETE MENU ITEM
   ============================================================ */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }
  res.json({ message: "Menu item deleted", _id: req.params.id });
});

/* ============================================================
   ADMIN — TOGGLE MENU ITEM AVAILABILITY
   ============================================================ */
export const toggleMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  item.isAvailable = !item.isAvailable;
  await item.save();
  res.json(item);
});
