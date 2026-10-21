/**
 * ============================================================
 * ORDER CONTROLLER
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Coupon from "../models/Coupon.js";
import Setting from "../models/Setting.js";
import { getIO } from "../config/socket.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import {
  sendAsync,
  orderConfirmationEmail,
  orderStatusEmail,
} from "../emails/index.js";
import {
  calculateOrderTotals,
  isValidPhone,
  parsePagination,
  logError,
} from "../utils/helpers.js";

/* ============================================================
   CREATE ORDER
   ============================================================ */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items: rawItems,
    address,
    phone,
    paymentMethod = "cod",
    couponCode = null,
  } = req.body;

  if (!rawItems?.length) {
    res.status(400);
    throw new Error("Cart is empty");
  }
  if (!address?.line1 || !address?.city || !address?.pincode) {
    res.status(400);
    throw new Error("Delivery address is required");
  }
  if (!isValidPhone(phone)) {
    res.status(400);
    throw new Error("A valid 10-digit phone number is required");
  }

  const validPaymentMethods = ["cod", "stripe", "razorpay", "phonepe", "upi"];
  if (!validPaymentMethods.includes(paymentMethod)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  const settings = await Setting.getSettings();
  if (!settings.isStoreOpen) {
    res.status(400);
    throw new Error("We are currently closed and not accepting new orders.");
  }

  const itemIds = rawItems.map((item) => item.mealId);
  const dbItems = await MenuItem.find({ _id: { $in: itemIds } });

  const trustedItems = rawItems.map((rawItem) => {
    const dbItem = dbItems.find(
      (d) => d._id.toString() === rawItem.mealId.toString(),
    );
    if (!dbItem) {
      res.status(404);
      throw new Error(`Item "${rawItem.name}" no longer exists`);
    }
    if (!dbItem.isAvailable) {
      res.status(400);
      throw new Error(`Item "${dbItem.name}" is currently out of stock`);
    }
    const qty = Number(rawItem.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      res.status(400);
      throw new Error("Invalid item quantity (must be 1-50)");
    }
    return {
      mealId: dbItem._id,
      name: dbItem.name,
      price: dbItem.price,
      quantity: qty,
      image: dbItem.image,
    };
  });

  const tempSubtotal = trustedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (tempSubtotal < settings.minOrderValue) {
    res.status(400);
    throw new Error(
      `Minimum order value is ₹${settings.minOrderValue}. Add ₹${
        settings.minOrderValue - tempSubtotal
      } more.`,
    );
  }

  let discount = 0;
  let appliedCoupon = null;

  if (couponCode?.trim()) {
    const coupon = await Coupon.findOne({
      code: couponCode.trim().toUpperCase(),
    });
    if (!coupon) {
      res.status(400);
      throw new Error("Invalid coupon code");
    }
    if (coupon.isFirstOrderOnly) {
      const pastOrders = await Order.countDocuments({ user: req.user._id });
      if (pastOrders > 0) {
        res.status(400);
        throw new Error("This coupon is only valid for your first order.");
      }
    }
    const check = coupon.isValid(tempSubtotal);
    if (!check.valid) {
      res.status(400);
      throw new Error(check.reason);
    }
    discount = coupon.calculateDiscount(tempSubtotal);
    appliedCoupon = coupon;
  }

  const isFreeDelivery = tempSubtotal >= settings.freeDeliveryThreshold;
  const finalDeliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const finalPackagingFee = settings.packagingFee || 0;

  const totals = calculateOrderTotals(trustedItems, {
    deliveryFee: finalDeliveryFee,
    taxRate: settings.taxRate / 100,
    discount: discount,
  });
  totals.packagingFee = finalPackagingFee;
  totals.total = totals.total + finalPackagingFee;

  const clientTotal = Number(req.body.total) || 0;
  if (Math.abs(clientTotal - totals.total) > 1) {
    logError(
      `[SECURITY] Price mismatch: client=₹${clientTotal}, server=₹${totals.total}`,
    );
  }

  const order = await Order.create({
    user: req.user._id,
    items: trustedItems,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    packagingFee: totals.packagingFee,
    tax: totals.tax,
    discount: totals.discount,
    couponCode: appliedCoupon?.code || null,
    total: totals.total,
    address: {
      label: address.label || "Home",
      line1: address.line1.trim(),
      line2: address.line2?.trim() || "",
      city: address.city.trim(),
      pincode: address.pincode.trim(),
    },
    phone: phone.trim(),
    paymentMethod,
    status: "pending",
    estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000),
  });

  if (appliedCoupon) {
    await Coupon.updateOne(
      { _id: appliedCoupon._id },
      { $inc: { usedCount: 1 } },
    );
  }

  // ✅ Socket notifications (Customer + Admin)
  try {
    // Notify the specific user
    getIO().to(`user:${req.user._id}`).emit("order:created", {
      orderId: order._id,
      status: order.status,
    });

    // Notify ALL Admins
    getIO().to("admin").emit("order:created", {
      orderId: order._id,
      customerName: req.user.name,
      total: order.total,
      itemCount: order.items.length,
    });
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  if (orderConfirmationEmail) {
    const { subject, html } = orderConfirmationEmail({
      name: req.user.name,
      order,
    });
    sendAsync({ to: req.user.email, subject, html });
  }

  res.status(201).json(order);
});

/* ============================================================
   GET MY ORDERS
   ============================================================ */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, 10);
  const showArchived = req.query.archived === "true";

  const filter = {
    user: req.user._id,
    archived: showArchived ? true : { $ne: true },
  };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

/* ============================================================
   GET SINGLE ORDER
   ============================================================ */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

/* ============================================================
   CANCEL ORDER
   ============================================================ */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    res.status(400);
    throw new Error(
      `Cannot cancel an order that is already "${order.status.replace(/_/g, " ")}".`,
    );
  }

  let refundInfo = null;

  if (order.paymentStatus === "paid" && order.paymentGateway === "stripe") {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intentToRefund = order.paymentIntentId || order.paymentId;
      if (intentToRefund) {
        const refund = await stripe.refunds.create({
          payment_intent: intentToRefund,
          reason: "requested_by_customer",
        });
        refundInfo = {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          gateway: "stripe",
        };
      }
    } catch (err) {
      console.error(`[Stripe refund failed]`, err.message);
      res.status(500);
      throw new Error(`Refund failed: ${err.message}`);
    }
  }

  if (order.paymentStatus === "paid" && order.paymentGateway === "razorpay") {
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      if (order.paymentId) {
        const payment = await razorpay.payments.fetch(order.paymentId);
        const refund = await razorpay.payments.refund(order.paymentId, {
          amount: payment.amount,
          speed: "normal",
        });
        refundInfo = {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          gateway: "razorpay",
        };
      }
    } catch (err) {
      console.error(`[Razorpay refund failed]`, err.message);
      res.status(500);
      throw new Error(`Refund failed: ${err.message}`);
    }
  }

  order.status = "cancelled";
  if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
  if (refundInfo) {
    order.refundId = refundInfo.id;
    order.refundAmount = refundInfo.amount;
    order.refundStatus = "processed";
    order.refundedAt = new Date();
  }

  await order.save();

  // ✅ Socket notifications (Customer + Admin)
  try {
    getIO().to(`user:${req.user._id}`).emit("order:status", {
      orderId: order._id,
      status: "cancelled",
    });
    getIO().to("admin").emit("order:status", {
      orderId: order._id,
      status: "cancelled",
    });
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  if (orderStatusEmail) {
    try {
      const { subject, html } = orderStatusEmail({
        name: req.user.name,
        order,
        status: "cancelled",
      });
      sendAsync({ to: req.user.email, subject, html });
    } catch {
      /* ignore */
    }
  }

  res.json({
    success: true,
    message: refundInfo
      ? `Order cancelled. Refund of ₹${refundInfo.amount} initiated.`
      : "Order cancelled successfully.",
    order,
    refund: refundInfo,
  });
});

/* ============================================================
   UPDATE ORDER STATUS (admin)
   ============================================================ */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate("user");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
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
  order.status = status;
  await order.save();

  // ✅ Socket notifications (Customer + Admin)
  try {
    getIO().to(`user:${order.user._id}`).emit("order:status", {
      orderId: order._id,
      status,
    });
    getIO().to("admin").emit("order:status", {
      orderId: order._id,
      status,
    });
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  if (orderStatusEmail && order.user?.email) {
    const { subject, html } = orderStatusEmail({
      name: order.user.name,
      order,
      status,
    });
    sendAsync({ to: order.user.email, subject, html });
  }
  res.json(order);
});

/* ============================================================
   ARCHIVE ORDER
   ============================================================ */
export const archiveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (!["delivered", "cancelled"].includes(order.status)) {
    res.status(400);
    throw new Error("Only completed or cancelled orders can be archived.");
  }

  order.archived = true;
  order.archivedAt = new Date();
  await order.save();

  res.json({ success: true, message: "Order archived", order });
});

/* ============================================================
   UNARCHIVE ORDER
   ============================================================ */
export const unarchiveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.archived = false;
  order.archivedAt = null;
  await order.save();

  res.json({ success: true, message: "Order restored", order });
});

/* ============================================================
   REORDER
   ============================================================ */
export const reorder = asyncHandler(async (req, res) => {
  const originalOrder = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("restaurant", "name image isActive");

  if (!originalOrder) {
    res.status(404);
    throw new Error("Original order not found");
  }
  if (!originalOrder.restaurant) {
    res.status(400);
    throw new Error("This order's restaurant is no longer available");
  }
  if (originalOrder.restaurant.isActive === false) {
    res.status(400);
    throw new Error(`"${originalOrder.restaurant.name}" is currently closed.`);
  }

  const availableItems = [];
  const unavailableItems = [];

  for (const orderItem of originalOrder.items) {
    const menuItem = await MenuItem.findById(orderItem.mealId);
    if (!menuItem) {
      unavailableItems.push({
        name: orderItem.name,
        reason: "No longer on the menu",
      });
      continue;
    }
    if (!menuItem.isAvailable) {
      unavailableItems.push({
        name: orderItem.name,
        reason: "Currently out of stock",
      });
      continue;
    }
    availableItems.push({
      mealId: menuItem._id.toString(),
      id: menuItem._id.toString(),
      name: menuItem.name,
      price: menuItem.price,
      quantity: orderItem.quantity,
      image: menuItem.image,
      restaurant: originalOrder.restaurant._id.toString(),
      restaurantName: originalOrder.restaurant.name,
    });
  }

  if (availableItems.length === 0) {
    res.status(400);
    throw new Error("None of the items from this order are available.");
  }

  res.json({
    success: true,
    items: availableItems,
    unavailableItems,
    restaurant: {
      _id: originalOrder.restaurant._id,
      name: originalOrder.restaurant.name,
      image: originalOrder.restaurant.image,
    },
    originalOrderId: originalOrder._id,
  });
});

/* ============================================================
   DOWNLOAD INVOICE (PDF)
   ============================================================ */
export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    !["paid", "refunded"].includes(order.paymentStatus) &&
    order.status !== "delivered"
  ) {
    res.status(400);
    throw new Error("Invoice is only available for paid or delivered orders.");
  }

  const doc = generateInvoice(order, req.user);

  const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoiceNo}.pdf"`,
  );

  doc.pipe(res);
  doc.end();
});
