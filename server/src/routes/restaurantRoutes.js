import express from "express";
import {
  listRestaurants,
  getRestaurantById,
  getMenuItemById,
  listAreas,
} from "../controllers/restaurantController.js";

const router = express.Router();

/* ============================================================
   Public routes — ORDER MATTERS
   Specific paths (/, /areas, /:rid/items/:itemId) MUST come
   before wildcard (/:id), or Express matches the wrong route.
   ============================================================ */

// Distinct areas for a city
router.get("/areas", listAreas);

// List restaurants (supports ?city=, ?area=, ?cuisine=, ?search=)
router.get("/", listRestaurants);

// Single menu item
router.get("/:rid/items/:itemId", getMenuItemById);

// Single restaurant with menu
router.get("/:id", getRestaurantById);

export default router;
