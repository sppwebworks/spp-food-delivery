import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  // ✅ Validate input
  if (!orderId || !rating) {
    res.status(400);
    throw new Error("orderId and rating are required");
  }
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  // ✅ Find the order
  const order = await Order.findOne({ _id: orderId, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.status !== "delivered") {
    res.status(400);
    throw new Error("You can only review delivered orders");
  }
  if (!order.restaurant) {
    res.status(400);
    throw new Error("This order doesn't have a restaurant attached");
  }

  // ✅ Check for duplicate review
  const existing = await Review.findOne({ order: orderId });
  if (existing) {
    res.status(400);
    throw new Error("You already reviewed this order");
  }

  // ✅ Create the review
  const review = await Review.create({
    user: req.user._id,
    restaurant: order.restaurant,
    order: orderId,
    rating,
    comment: comment || "",
  });

  // ✅ Update restaurant rating
  const allReviews = await Review.find({ restaurant: order.restaurant });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  await Restaurant.findByIdAndUpdate(order.restaurant, {
    rating: Number(avgRating.toFixed(1)),
    reviewCount: allReviews.length,
  });

  res.status(201).json(review);
});

export const getRestaurantReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    restaurant: req.params.restaurantId,
  })
    .populate("user", "name")
    .sort("-createdAt");

  res.json(reviews);
});
