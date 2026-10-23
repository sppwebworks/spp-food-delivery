import asyncHandler from "express-async-handler";
import DeliveryPartner from "../models/DeliveryPartner.js";
import Order from "../models/Order.js";
import { getIO } from "../config/socket.js";

/* ============================================================
   GET /api/rider/me
   ============================================================ */
export const getMyRiderProfile = asyncHandler(async (req, res) => {
  res.json(req.rider);
});

/* ============================================================
   GET /api/rider/orders
   ============================================================ */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { deliveryPartner: req.rider._id };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate("user", "name phone")
    .populate("restaurant", "name image address")
    .sort("-createdAt")
    .limit(50);

  res.json({ orders });
});

/* ============================================================
   GET /api/rider/orders/:id
   ============================================================ */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    deliveryPartner: req.rider._id,
  })
    .populate("user", "name phone email")
    .populate("restaurant", "name image address");

  if (!order) {
    res.status(404);
    throw new Error("Order not found or not assigned to you");
  }
  res.json(order);
});

/* ============================================================
   PUT /api/rider/orders/:id/status
   ============================================================ */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, otp } = req.body;

  if (!["out_for_delivery", "delivered"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Allowed: out_for_delivery, delivered");
  }

  const order = await Order.findOne({
    _id: req.params.id,
    deliveryPartner: req.rider._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (status === "out_for_delivery") {
    order.status = "out_for_delivery";
    order.pickedUpAt = new Date();
    await order.save();

    try {
      getIO().to(`order:${order._id}`).emit("order:status", {
        orderId: order._id,
        status: order.status,
      });
    } catch (_) {}

    return res.json({ success: true, order });
  }

  if (status === "delivered") {
    if (!order.deliveryOtp) {
      res.status(400);
      throw new Error("No OTP on order. Please contact support.");
    }
    if (!otp || otp.toString().trim() !== order.deliveryOtp.toString().trim()) {
      res.status(400);
      throw new Error("Invalid OTP. Ask the customer for the 4-digit code.");
    }

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.deliveryOtpVerified = true;
    if (order.paymentMethod === "cod") order.paymentStatus = "paid";
    await order.save();

    req.rider.totalDeliveries += 1;
    req.rider.totalEarnings += 30;
    req.rider.status = "available";
    await req.rider.save();

    try {
      getIO().to(`order:${order._id}`).emit("order:status", {
        orderId: order._id,
        status: order.status,
      });
      getIO().to(`rider:${req.rider._id}`).emit("order:completed", {
        orderId: order._id,
      });
    } catch (_) {}

    return res.json({ success: true, order });
  }
});

/* ============================================================
   PUT /api/rider/status
   ============================================================ */
export const updateMyStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  req.rider.isOnline = !!isOnline;
  req.rider.status = isOnline ? "available" : "offline";
  await req.rider.save();
  res.json({ success: true, rider: req.rider });
});

/* ============================================================
   PUT /api/rider/location  ✅ THIS WAS MISSING
   ============================================================ */
export const updateMyLocation = asyncHandler(async (req, res) => {
  const { lat, lng, orderId } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400);
    throw new Error("lat and lng must be numbers");
  }

  req.rider.currentLocation = { type: "Point", coordinates: [lng, lat] };
  await req.rider.save();

  if (orderId) {
    try {
      getIO().to(`order:${orderId}`).emit("rider:location", { lat, lng });
    } catch (_) {}
  }

  res.json({ success: true });
});
