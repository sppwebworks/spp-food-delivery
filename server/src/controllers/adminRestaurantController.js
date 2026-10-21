/**
 * ============================================================
 * ADMIN RESTAURANT CONTROLLER
 * ============================================================
 * All routes protected by adminOnly middleware.
 *
 * Restaurants:
 *   POST   /api/admin/restaurants
 *   PUT    /api/admin/restaurants/:id
 *   DELETE /api/admin/restaurants/:id
 *   PUT    /api/admin/restaurants/:id/toggle   (activate/deactivate)
 *
 * Menu items:
 *   POST   /api/admin/restaurants/:id/items
 *   PUT    /api/admin/items/:id
 *   DELETE /api/admin/items/:id
 *   PUT    /api/admin/items/:id/toggle          (available/sold out)
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";

/* ---------- CREATE RESTAURANT ---------- */
export const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    image,
    cuisines,
    category,
    rating,
    reviews,
    deliveryTime,
    priceForTwo,
    address,
    tags,
    isVeg,
    isFeatured,
    offers,
  } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Restaurant name is required");
  }
  if (!Array.isArray(cuisines) || cuisines.length === 0) {
    res.status(400);
    throw new Error("At least one cuisine is required");
  }

  const restaurant = await Restaurant.create({
    name: name.trim(),
    description: description?.trim() || "",
    image: image || undefined,
    cuisines,
    category: category || cuisines[0] || "Multi-cuisine",
    rating: rating ?? 4.2,
    reviews: reviews || "0",
    deliveryTime: deliveryTime ?? 30,
    priceForTwo: priceForTwo ?? 400,
    address: address || {},
    tags: tags || [],
    isVeg: isVeg ?? false,
    isFeatured: isFeatured ?? false,
    offers: offers || [],
    isActive: true,
  });

  res.status(201).json(restaurant);
});

/* ---------- UPDATE RESTAURANT ---------- */
export const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  const allowed = [
    "name",
    "description",
    "image",
    "cuisines",
    "category",
    "rating",
    "reviews",
    "deliveryTime",
    "priceForTwo",
    "address",
    "tags",
    "isVeg",
    "isFeatured",
    "offers",
    "isActive",
  ];

  allowed.forEach((k) => {
    if (req.body[k] !== undefined) restaurant[k] = req.body[k];
  });

  await restaurant.save();
  res.json(restaurant);
});

/* ---------- DELETE RESTAURANT + ITS MENU ---------- */
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  await Promise.all([
    Restaurant.deleteOne({ _id: restaurant._id }),
    MenuItem.deleteMany({ restaurant: restaurant._id }),
  ]);

  res.json({ message: "Restaurant and menu deleted" });
});

/* ---------- TOGGLE RESTAURANT ACTIVE ---------- */
export const toggleRestaurantActive = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  restaurant.isActive = !restaurant.isActive;
  await restaurant.save();
  res.json(restaurant);
});

/* ---------- LIST ALL (admin — includes inactive) ---------- */
export const adminListRestaurants = asyncHandler(async (req, res) => {
  const { q, active } = req.query;

  const filter = {};
  if (q?.trim()) {
    const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: safeQ, $options: "i" };
  }
  if (active === "true") filter.isActive = true;
  if (active === "false") filter.isActive = false;

  const restaurants = await Restaurant.find(filter).sort("-createdAt").lean();

  // Attach item counts
  const withCounts = await Promise.all(
    restaurants.map(async (r) => {
      const count = await MenuItem.countDocuments({ restaurant: r._id });
      return { ...r, itemCount: count };
    }),
  );

  res.json({ restaurants: withCounts, total: withCounts.length });
});

/* ---------- CREATE MENU ITEM ---------- */
export const createMenuItem = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;
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
    isBestseller,
    rating,
    tags,
  } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    res.status(404);
    throw new Error("Restaurant not found");
  }

  if (!name?.trim()) {
    res.status(400);
    throw new Error("Item name is required");
  }
  if (!price || Number(price) < 1) {
    res.status(400);
    throw new Error("Valid price is required");
  }

  const item = await MenuItem.create({
    restaurant: restaurant._id,
    name: name.trim(),
    description: description?.trim() || "",
    image: image || "",
    price: Number(price),
    mrp: mrp ? Number(mrp) : 0,
    category: category?.trim() || "Recommended",
    isVeg: isVeg ?? false,
    isAvailable: isAvailable ?? true,
    isRecommended: isRecommended ?? false,
    isBestseller: isBestseller ?? false,
    rating: rating ?? 4.3,
    tags: tags || [],
  });

  res.status(201).json(item);
});

/* ---------- UPDATE MENU ITEM ---------- */
export const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  const allowed = [
    "name",
    "description",
    "image",
    "price",
    "mrp",
    "category",
    "isVeg",
    "isAvailable",
    "isRecommended",
    "isBestseller",
    "rating",
    "tags",
  ];

  allowed.forEach((k) => {
    if (req.body[k] !== undefined) item[k] = req.body[k];
  });

  await item.save();
  res.json(item);
});

/* ---------- DELETE MENU ITEM ---------- */
export const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  await MenuItem.deleteOne({ _id: item._id });
  res.json({ message: "Menu item deleted" });
});

/* ---------- TOGGLE ITEM AVAILABLE ---------- */
export const toggleMenuItemAvailable = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Menu item not found");
  }

  item.isAvailable = !item.isAvailable;
  await item.save();
  res.json(item);
});
