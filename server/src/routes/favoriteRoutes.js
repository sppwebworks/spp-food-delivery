import express from "express";
import {
  getFavorites,
  toggleFavorite,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", getFavorites);
router.post("/:restaurantId", toggleFavorite);
export default router;
