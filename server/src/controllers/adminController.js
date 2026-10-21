/**
 * ============================================================
 * ADMIN CONTROLLER
 * ============================================================
 * Order management + dashboard stats + user list
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { parsePagination } from "../utils/helpers.js";
import { getIO } from "../config/socket.js";

/* ============================================================
   LIST ALL ORDERS (paginated)
   ============================================================ */
export const listOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const { page, limit, skip } = parsePagination(req.query, 20);

  const filter = {};
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});

/* ============================================================
   GET SINGLE ORDER
   ============================================================ */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email phone",
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

/* ============================================================
   UPDATE ORDER STATUS
   ============================================================ */
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const valid = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];
  if (!valid.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  const populatedOrder = await Order.findById(order._id).populate(
    "user",
    "name email phone",
  );

  // Notify the specific user
  try {
    getIO()
      .to(`user:${order.user}`)
      .emit("order:status", { orderId: order._id, status });

    // Notify admins (in case they have multiple tabs open)
    getIO().to("admin").emit("order:status", { orderId: order._id, status });
  } catch {
    /* socket optional */
  }

  res.json(populatedOrder);
});

/* ============================================================
   DASHBOARD STATS (With Chart Data)
   ============================================================ */
export const getStats = asyncHandler(async (req, res) => {
  // 1. Get last 7 days of revenue
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const revenueByDay = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Top 5 Items by Revenue
  const topRestaurants = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$items.name", // ✅ Matches the item name in the order schema
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // 3. Basic Totals
  const [totalOrders, totalUsers, revenueAgg, statusAgg] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  res.json({
    totalOrders,
    totalUsers,
    totalRevenue: revenueAgg[0]?.total || 0,
    byStatus: statusAgg.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    charts: {
      revenueByDay,
      topRestaurants,
    },
  });
});

/* ============================================================
   LIST USERS
   ============================================================ */
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 100);

  const [users, total] = await Promise.all([
    User.find().select("-password").sort("-createdAt").skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({
    users,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});
