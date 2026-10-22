import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

/* ============================================================
   ADMIN — GET ALL COUPONS
   ============================================================ */
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.set("Cache-Control", "no-store"); // ✅ admin list must never be cached
  res.json({ coupons });
});

/* ============================================================
   ADMIN — CREATE COUPON
   ============================================================ */
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, expiresAt, isActive } = req.body;

  if (!code || !code.trim()) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    res.status(400);
    throw new Error("Coupon code already exists");
  }

  const payload = {
    ...req.body,
    code: code.toUpperCase().trim(),
    discountType: (req.body.discountType || "flat").toLowerCase(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    // ✅ Force isActive to a real boolean (guards against "false" string)
    isActive:
      isActive === undefined ? true : isActive === true || isActive === "true",
  };

  const coupon = await Coupon.create(payload);
  res.status(201).json(coupon);
});

/* ============================================================
   ADMIN — UPDATE COUPON
   ============================================================ */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { expiresAt, isActive, code } = req.body;

  const payload = {
    ...req.body,
    discountType: req.body.discountType
      ? req.body.discountType.toLowerCase()
      : undefined,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  };

  // ✅ Handle isActive explicitly so "false" string or false bool both work
  if (isActive !== undefined) {
    payload.isActive = isActive === true || isActive === "true";
  } else {
    delete payload.isActive; // don't accidentally wipe it
  }

  // ✅ Normalise code if it's being updated
  if (code) {
    payload.code = code.toUpperCase().trim();
  } else {
    delete payload.code;
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    res.status(404);
    throw new Error("Coupon not found");
  }
  res.set("Cache-Control", "no-store"); // ✅ prevent stale admin reads
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
   PUBLIC — VALIDATE COUPON (Checkout)
   ============================================================ */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    res.status(400);
    throw new Error("Coupon code is required");
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase().trim(),
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
   PUBLIC — GET ACTIVE COUPONS (Offers Page)
   ============================================================ */
export const getActiveCoupons = asyncHandler(async (req, res) => {
  // ✅ Returns ONLY active, non-expired coupons
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  })
    // ✅ Added `expiresAt` so the frontend can do its own expiry guard
    .select(
      "_id code description discountType discountValue minOrderValue maxDiscount expiresAt",
    )
    .sort("-createdAt");

  // ✅ Prevent any CDN / browser cache from serving stale coupons
  // (Render and Vercel both honour this header)
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  res.json({ coupons });
});
