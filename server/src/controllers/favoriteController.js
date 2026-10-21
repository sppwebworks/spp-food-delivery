import asyncHandler from "express-async-handler";
import Favorite from "../models/Favorite.js";

export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate("restaurant")
    .sort("-createdAt");

  const restaurants = favorites
    .map((f) => f.restaurant)
    .filter((r) => r !== null);
  res.json(restaurants);
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const existing = await Favorite.findOne({
    user: req.user._id,
    restaurant: restaurantId,
  });

  if (existing) {
    await existing.deleteOne();
    res.json({ isFavorited: false, message: "Removed from favorites" });
  } else {
    await Favorite.create({ user: req.user._id, restaurant: restaurantId });
    res.json({ isFavorited: true, message: "Added to favorites" });
  }
});
