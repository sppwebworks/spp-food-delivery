/**
 * ============================================================
 * COUPON CONTROLLER
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

/* ============================================================
   PUBLIC — POST /api/coupons/validate
   ============================================================
   Rules:
   1. Coupon must exist
   2. Coupon must be active
   3. Coupon must not be expired
   4. Subtotal must meet minOrderValue
   5. Coupon must NOT have been used by this user before
      (applies to ALL coupons — single use per customer)
   6. If isFirstOrderOnly, user must have 0 past orders
   ============================================================ */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code || !subtotal) {
    res.status(400);
    throw new Error("Coupon code and subtotal are required");
  }

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }

  // Check if active
  if (!coupon.isActive) {
    res.status(400);
    throw new Error("This coupon is no longer active");
  }

  // Check expiry
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400);
    throw new Error("This coupon has expired");
  }

  // Check min order value
  if (subtotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(
      `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
    );
  }

  // Check max uses (global limit)
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    res.status(400);
    throw new Error("This coupon has reached its usage limit");
  }

  /* ============================================================
     ✅ STEP 1: CHECK IF USER ALREADY USED THIS EXACT COUPON
     ============================================================
     This applies to ALL coupons (not just first-order-only).
     Each coupon can only be used once per customer.
     ============================================================ */
  const usedBefore = await Order.findOne({
    user: req.user._id,
    couponCode: coupon.code,
  }).sort("-createdAt");

  if (usedBefore) {
    const orderRef = usedBefore._id.toString().slice(-6).toUpperCase();
    res.status(400);
    throw new Error(
      `You've already used ${coupon.code} on order #${orderRef}. `,
    );
  }

  /* ============================================================
     ✅ STEP 2: FIRST-ORDER-ONLY CHECK
     ============================================================
     If this coupon is marked first-order-only, the user must
     have zero past orders (of any kind).
     ============================================================ */
  if (coupon.isFirstOrderOnly) {
    const pastOrders = await Order.countDocuments({ user: req.user._id });
    if (pastOrders > 0) {
      res.status(400);
      throw new Error(
        `${coupon.code} is only valid on your first order. ` +
          `Since you've already placed orders, this coupon isn't available to you.`,
      );
    }
  }

  /* ============================================================
     CALCULATE DISCOUNT
     ============================================================ */
  let discount = 0;
  const type = String(coupon.discountType || "")
    .toLowerCase()
    .trim();

  if (type.includes("percent") || type.includes("%")) {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (
      coupon.maxDiscount &&
      coupon.maxDiscount > 0 &&
      discount > coupon.maxDiscount
    ) {
      discount = coupon.maxDiscount;
    }
  } else if (
    type.includes("fix") ||
    type.includes("flat") ||
    type.includes("amount")
  ) {
    discount = Math.min(coupon.discountValue, subtotal);
  } else {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (
      coupon.maxDiscount &&
      coupon.maxDiscount > 0 &&
      discount > coupon.maxDiscount
    ) {
      discount = coupon.maxDiscount;
    }
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discount: discount,
      type: coupon.discountType,
    },
  });
});

/* ============================================================
   ADMIN — LIST COUPONS
   ============================================================ */
export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.json({ coupons, total: coupons.length });
});

/* ============================================================
   ADMIN — CREATE COUPON
   ============================================================ */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    expiresAt,
    maxUses,
    isActive,
    isFirstOrderOnly,
  } = req.body;

  if (!code?.trim() || !discountType || discountValue === undefined) {
    res.status(400);
    throw new Error("Code, discount type, and value are required");
  }

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error("A coupon with this code already exists");
  }

  const normalizedType = String(discountType).toLowerCase().trim();

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    description: description?.trim() || "",
    discountType: normalizedType,
    discountValue: Number(discountValue),
    maxDiscount: Number(maxDiscount) || 0,
    minOrderValue: Number(minOrderValue) || 0,
    expiresAt: expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxUses: Number(maxUses) || 0,
    isActive: isActive !== false,
    isFirstOrderOnly: isFirstOrderOnly === true,
  });

  res.status(201).json(coupon);
});

/* ============================================================
   ADMIN — UPDATE COUPON
   ============================================================ */
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }

  const fields = [
    "description",
    "discountType",
    "discountValue",
    "maxDiscount",
    "minOrderValue",
    "expiresAt",
    "maxUses",
    "isActive",
    "isFirstOrderOnly",
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      if (f === "expiresAt") {
        coupon[f] = new Date(req.body[f]);
      } else if (f === "discountType") {
        coupon[f] = String(req.body[f]).toLowerCase().trim();
      } else {
        coupon[f] = req.body[f];
      }
    }
  });

  await coupon.save();
  res.json(coupon);
});

/* ============================================================
   ADMIN — DELETE COUPON
   ============================================================ */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.json({ message: "Coupon deleted", _id: req.params.id });
});
