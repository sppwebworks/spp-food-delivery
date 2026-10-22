import express from "express";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// All coupon admin routes require a valid admin token
router.use(protect, adminOnly);

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").put(updateCoupon).delete(deleteCoupon);

export default router;
