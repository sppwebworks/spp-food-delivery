import asyncHandler from "express-async-handler";
import DeliveryPartner from "../models/DeliveryPartner.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { getIO } from "../config/socket.js";

/* ============================================================
   GET ALL RIDERS (Admin)
   ============================================================ */
export const listRiders = asyncHandler(async (req, res) => {
  const { status, isApproved } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (isApproved !== undefined) filter.isApproved = isApproved === "true";

  const riders = await DeliveryPartner.find(filter)
    .populate("user", "name email phone avatar")
    .sort("-createdAt");

  res.json({ riders });
});

/* ============================================================
   CREATE RIDER (Admin promotes a user)
   ============================================================ */
export const createRider = asyncHandler(async (req, res) => {
  const { userId, phone, vehicleType, vehicleNumber, isApproved } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const existing = await DeliveryPartner.findOne({ user: userId });
  if (existing) {
    res.status(400);
    throw new Error("This user is already a delivery partner");
  }

  user.role = "rider";
  await user.save();

  const rider = await DeliveryPartner.create({
    user: userId,
    phone: phone || user.phone,
    vehicleType: vehicleType || "bike",
    vehicleNumber: vehicleNumber || "",
    isApproved: isApproved === true,
  });

  res.status(201).json({ rider });
});

/* ============================================================
   APPROVE RIDER
   ============================================================ */
export const approveRider = asyncHandler(async (req, res) => {
  const rider = await DeliveryPartner.findById(req.params.id).populate("user");
  if (!rider) {
    res.status(404);
    throw new Error("Rider not found");
  }
  rider.isApproved = true;
  await rider.save();

  try {
    getIO().to(`rider:${rider._id}`).emit("rider:approved", {
      riderId: rider._id,
    });
  } catch (_) {}

  res.json({ success: true, rider });
});

/* ============================================================
   REJECT RIDER
   ============================================================ */
export const rejectRider = asyncHandler(async (req, res) => {
  const rider = await DeliveryPartner.findById(req.params.id);
  if (!rider) {
    res.status(404);
    throw new Error("Rider not found");
  }
  rider.isApproved = false;
  rider.status = "offline";
  rider.isOnline = false;
  await rider.save();
  res.json({ success: true, rider });
});

/* ============================================================
   ASSIGN RIDER TO ORDER
   ============================================================ */
export const assignRiderToOrder = asyncHandler(async (req, res) => {
  const { riderId } = req.body;

  const order = await Order.findById(req.params.id).populate("user");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const rider = await DeliveryPartner.findById(riderId).populate("user");
  if (!rider) {
    res.status(404);
    throw new Error("Rider not found");
  }

  if (!rider.isApproved) {
    res.status(400);
    throw new Error("Rider is not approved");
  }
  if (rider.status === "busy") {
    res.status(400);
    throw new Error("Rider is currently on another delivery");
  }

  // Generate 4-digit OTP
  const otp = String(Math.floor(1000 + Math.random() * 9000));

  // Update order
  order.deliveryPartner = rider._id;
  order.assignedAt = new Date();
  order.deliveryOtp = otp;
  order.deliveryOtpVerified = false;
  if (["pending", "confirmed", "preparing"].includes(order.status)) {
    order.status = "ready_for_pickup";
  }
  await order.save();

  // Update rider
  rider.status = "busy";
  await rider.save();

  // Notify Rider
  try {
    getIO()
      .to(`rider:${rider._id}`)
      .emit("order:assigned", {
        orderId: order._id,
        shortId: order._id.toString().slice(-6).toUpperCase(),
        total: order.total,
        address: order.address,
      });
  } catch (_) {}

  // Notify Customer
  try {
    getIO().to(`order:${order._id}`).emit("order:rider-assigned", {
      orderId: order._id,
      riderName: rider.user?.name,
      riderPhone: rider.phone,
      otp,
    });
  } catch (_) {}

  res.json({ success: true, order, otp });
});

/* ============================================================
   GET AVAILABLE RIDERS FOR ASSIGNMENT
   ============================================================ */
export const availableRidersForOrder = asyncHandler(async (req, res) => {
  const riders = await DeliveryPartner.find({
    isApproved: true,
    isOnline: true,
    status: "available",
  })
    .populate("user", "name phone email")
    .sort("-totalDeliveries");

  res.json({ riders });
});
