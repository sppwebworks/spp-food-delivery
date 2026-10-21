import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import { stripe } from "../config/stripe.js";
import { razorpay } from "../config/razorpay.js";
import { phonepeClient } from "../config/phonepe.js";
import { formatCurrency, logError } from "../utils/helpers.js";
import { StandardCheckoutPayRequest } from "@phonepe-pg/pg-sdk-node"; // ✅ Added

export const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, method, amount } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.paymentStatus === "paid") {
    res.status(400);
    throw new Error("This order is already paid");
  }

  const clientAmount = Number(amount);
  if (
    amount !== undefined &&
    !isNaN(clientAmount) &&
    Math.abs(clientAmount - order.total) > 0.01
  ) {
    logError(
      `[SECURITY] Payment mismatch: client=₹${clientAmount}, order=₹${order.total}`,
    );
    if (clientAmount < order.total) {
      res.status(400);
      throw new Error(
        `Payment amount mismatch. Expected ${formatCurrency(order.total)}.`,
      );
    }
  }

  switch (method) {
    case "cod":
      order.paymentStatus = "pending";
      await order.save();
      return res.json({
        method: "cod",
        message: "Cash on delivery confirmed",
        amount: order.total,
      });
    case "stripe":
      return res.json(await createStripeIntent(order));
    case "razorpay":
      return res.json(await createRazorpayOrder(order));
    case "phonepe":
      return res.json(await createPhonePeOrder(order)); // ✅ Added
    default:
      res.status(400);
      throw new Error("Unsupported payment method");
  }
});

async function createStripeIntent(order) {
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: "inr",
    metadata: { orderId: order._id.toString(), userId: order.user.toString() },
    automatic_payment_methods: { enabled: true },
  });
  order.paymentIntentId = intent.id;
  await order.save();
  return {
    method: "stripe",
    clientSecret: intent.client_secret,
    amount: order.total,
    currency: "inr",
  };
}

async function createRazorpayOrder(order) {
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString() },
  });
  order.razorpayOrderId = rzpOrder.id;
  await order.save();
  return {
    method: "razorpay",
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

async function createPhonePeOrder(order) {
  if (!phonepeClient)
    throw new Error("PhonePe is not configured. Add credentials to .env");
  const merchantOrderId = `order_${order._id}_${Date.now()}`;
  const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(Math.round(order.total * 100))
    .redirectUrl(
      `${process.env.CLIENT_URL}/orders/${order._id}?paid=1&gateway=phonepe`,
    )
    .build();
  const response = await phonepeClient.pay(request);
  order.phonepeMerchantOrderId = merchantOrderId;
  await order.save();
  return {
    method: "phonepe",
    redirectUrl: response.redirectUrl,
    merchantOrderId,
    amount: order.total,
  };
}

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, gateway } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (gateway === "razorpay" && signature) {
    const crypto = await import("crypto");
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(order.razorpayOrderId + "|" + paymentId)
      .digest("hex");
    if (expected !== signature) {
      res.status(400);
      throw new Error("Invalid payment signature");
    }
  }

  order.paymentStatus = "paid";
  order.paymentGateway = gateway || "razorpay";
  order.paymentId = paymentId;
  order.status = "confirmed";
  await order.save();
  res.json({ success: true, order });
});

export const verifyStripePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.paymentStatus === "paid")
    return res.json({ success: true, order, alreadyPaid: true });
  if (!order.paymentIntentId)
    return res.json({
      success: true,
      order,
      message: "No Stripe payment to verify",
    });

  try {
    const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    if (intent.status === "succeeded") {
      order.paymentStatus = "paid";
      order.paymentGateway = "stripe";
      order.paymentId = intent.id;
      order.status = "confirmed";
      await order.save();
      return res.json({ success: true, order });
    }
    return res.json({
      success: false,
      order,
      stripeStatus: intent.status,
      message: `Stripe status: ${intent.status}`,
    });
  } catch (err) {
    return res.json({
      success: false,
      order,
      message: "Could not reach Stripe",
    });
  }
});

export const verifyPhonePePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.paymentStatus === "paid")
    return res.json({ success: true, order, alreadyPaid: true });
  if (!order.phonepeMerchantOrderId || !phonepeClient)
    return res.json({
      success: false,
      order,
      message: "No PhonePe payment to verify",
    });

  try {
    const status = await phonepeClient.getOrderStatus(
      order.phonepeMerchantOrderId,
    );
    if (status.state === "COMPLETED") {
      order.paymentStatus = "paid";
      order.paymentGateway = "phonepe";
      order.paymentId = status.transactionId || order.phonepeMerchantOrderId;
      order.status = "confirmed";
      await order.save();
      return res.json({ success: true, order });
    }
    return res.json({
      success: false,
      order,
      phonepeState: status.state,
      message: `PhonePe state: ${status.state}`,
    });
  } catch (err) {
    return res.json({
      success: false,
      order,
      message: "Could not reach PhonePe",
    });
  }
});
