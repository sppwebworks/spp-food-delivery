import express from "express";
import {
  listAllRestaurantsAdmin,
  createRestaurant,
  updateRestaurant,
  toggleRestaurant,
  deleteRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItem,
} from "../controllers/restaurantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  next();
};

router.use(protect, adminOnly);

/* ---------- Restaurants ---------- */
router.get("/restaurants", listAllRestaurantsAdmin);
router.post("/restaurants", createRestaurant);
router.put("/restaurants/:id", updateRestaurant);
router.put("/restaurants/:id/toggle", toggleRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

/* ---------- Menu items ---------- */
router.post("/restaurants/:id/items", createMenuItem);
router.put("/items/:id", updateMenuItem);
router.put("/items/:id/toggle", toggleMenuItem);
router.delete("/items/:id", deleteMenuItem);

export default router;
