/**
 * ============================================================
 * WEBHOOK CONTROLLER — PRODUCTION
 * ============================================================
 * Mounted with express.raw() in webhookRoutes.js.
 * req.body is a Buffer — NOT parsed JSON.
 *
 * Verifies signatures with Stripe SDK / Razorpay HMAC.
 * Updates order status only when signature is valid.
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Order from "../models/Order.js";
import { stripe } from "../config/stripe.js";

/* ============================================================
   STRIPE WEBHOOK
   ============================================================ */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const rawBody = req.body; // Buffer

  if (!sig) {
    res.status(400).send("Missing stripe-signature header");
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log("[Stripe Webhook] Verified event:", event.type);

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          paymentGateway: "stripe",
          paymentId: intent.id,
          status: "confirmed",
        });
        console.log(`✅ Stripe: Order ${orderId} marked as paid`);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      const orderId = intent.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
        console.log(`❌ Stripe: Order ${orderId} payment failed`);
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] DB update failed:", err.message);
  }

  res.json({ received: true });
});

/* ============================================================
   RAZORPAY WEBHOOK
   ============================================================ */
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; // Buffer

  if (!signature) {
    res.status(400).send("Missing x-razorpay-signature header");
    return;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    console.error("[Razorpay Webhook] Invalid signature");
    res.status(400).send("Invalid signature");
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    res.status(400).send("Invalid JSON body");
    return;
  }

  console.log("[Razorpay Webhook] Verified event:", event.event);

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          paymentGateway: "razorpay",
          paymentId: payment.id,
          status: "confirmed",
        });
        console.log(`✅ Razorpay: Order ${orderId} marked as paid`);
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
        console.log(`❌ Razorpay: Order ${orderId} payment failed`);
      }
    }
  } catch (err) {
    console.error("[Razorpay Webhook] DB update failed:", err.message);
  }

  res.json({ received: true });
});

/* ============================================================
   PHONEPE WEBHOOK — stub for now
   ============================================================
   When you add real PhonePe integration later, verify the
   Authorization header against the PhonePe SDK here.
   ============================================================ */
export const phonepeWebhook = asyncHandler(async (req, res) => {
  console.log("[PhonePe Webhook] Received — not implemented");
  res.json({ received: true });
});
