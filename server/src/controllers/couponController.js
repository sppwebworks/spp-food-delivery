import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

/* ============================================================
   ADMIN — GET ALL COUPONS
   ============================================================ */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.json({ coupons });
});

/* ============================================================
   ADMIN — CREATE COUPON
   ============================================================ */
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, expiresAt } = req.body;
  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }
  const payload = {
    ...req.body,
    code: code.toUpperCase(),
    discountType: req.body.discountType.toLowerCase(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  };
  const coupon = await Coupon.create(payload);
  res.status(201).json(coupon);
});

/* ============================================================
   ADMIN — UPDATE COUPON
   ============================================================ */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { expiresAt } = req.body;
  const payload = {
    ...req.body,
    discountType: req.body.discountType
      ? req.body.discountType.toLowerCase()
      : undefined,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  };
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
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
  res.json({ message: "Coupon deleted" });
});

/* ============================================================
   PUBLIC — VALIDATE COUPON
   ============================================================ */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });
  if (!coupon) {
    res.status(404);
    throw new Error("Invalid coupon code");
  }
  const check = coupon.isValid(subtotal);
  if (!check.valid) {
    res.status(400);
    throw new Error(check.reason);
  }
  const discount = coupon.calculateDiscount(subtotal);
  res.json({
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discount: discount,
    },
  });
});

/* ============================================================
   PUBLIC — GET ACTIVE COUPONS
   ============================================================ */
export const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
  })
    .select("code description discountType discountValue minOrderValue")
    .sort("-createdAt");
  res.json({ coupons });
});
