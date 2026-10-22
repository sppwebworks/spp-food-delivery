import express from "express";
import { validateCoupon, getActiveCoupons } from "../controllers/couponController.js";

const router = express.Router();

router.get("/", getActiveCoupons);       // For Offers page
router.post("/validate", validateCoupon); // For Checkout

export default router;