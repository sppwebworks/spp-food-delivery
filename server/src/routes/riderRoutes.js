import express from "express";
import {
  getMyRiderProfile,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateMyStatus,
  updateMyLocation, // ✅ Import the new function
} from "../controllers/riderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { riderOnly } from "../middleware/riderMiddleware.js";

const router = express.Router();

router.use(protect, riderOnly);

router.get("/me", getMyRiderProfile);
router.put("/status", updateMyStatus);

// ✅ THIS IS THE ROUTE THAT WAS MISSING
router.put("/location", updateMyLocation);

router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);

export default router;
