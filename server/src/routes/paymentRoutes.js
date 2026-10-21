import express from "express";
import {
  initiatePayment,
  verifyPayment,
  verifyStripePayment,
  verifyPhonePePayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/initiate", protect, initiatePayment);
router.post("/verify", protect, verifyPayment);
router.post("/verify-stripe", protect, verifyStripePayment);
router.post("/verify-phonepe", protect, verifyPhonePePayment); // ✅ Added

export default router;
