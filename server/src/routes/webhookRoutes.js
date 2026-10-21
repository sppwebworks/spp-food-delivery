import express from "express";
import {
  stripeWebhook,
  razorpayWebhook,
  phonepeWebhook,
} from "../controllers/webhookController.js";

const router = express.Router();

/* ============================================================
   WEBHOOK ROUTES — RAW BODY REQUIRED
   ============================================================
   These use express.raw() to keep req.body as a Buffer.
   MUST be mounted BEFORE express.json() in app.js.
   ============================================================ */

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

router.post("/razorpay", express.raw({ type: "*/*" }), razorpayWebhook);

router.post("/phonepe", express.raw({ type: "*/*" }), phonepeWebhook);

export default router;
