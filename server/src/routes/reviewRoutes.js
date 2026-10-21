/**
 * ============================================================
 * REVIEW ROUTES
 * ============================================================
 * Public:  GET /api/reviews/restaurant/:restaurantId
 * Private: POST /api/reviews
 * ============================================================
 */

import express from "express";
import {
  createReview,
  getRestaurantReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */

// Get all reviews for a specific restaurant
router.get("/restaurant/:restaurantId", getRestaurantReviews);

/* ---------- PROTECTED ROUTES ---------- */

// Create a new review (requires login)
router.post("/", protect, createReview);

export default router;
