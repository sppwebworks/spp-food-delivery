/**
 * ============================================================
 * COUPON MODEL
 * ============================================================
 */

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    discountType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // ✅ REMOVED: enum: ["percentage", "fixed"]
      // Now accepts "percentage", "fixed", "flat", "Flat", "Fixed Amount", etc.
      // The controller handles all variations via type.includes(...)
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discount value cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxUses: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

/* ============================================================
   METHODS
   ============================================================ */

// Check if the coupon can be used on a given subtotal
couponSchema.methods.isValid = function (subtotal) {
  if (!this.isActive) {
    return { valid: false, reason: "This coupon is no longer active" };
  }
  if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
    return { valid: false, reason: "This coupon has expired" };
  }
  if (this.maxUses > 0 && this.usedCount >= this.maxUses) {
    return { valid: false, reason: "This coupon has reached its usage limit" };
  }
  if (subtotal < this.minOrderValue) {
    return {
      valid: false,
      reason: `Minimum order value for this coupon is ₹${this.minOrderValue}`,
    };
  }
  return { valid: true };
};

// Calculate the discount amount for a given subtotal
// ✅ Bulletproof: accepts "percentage", "percent", "%", "fixed", "flat", etc.
couponSchema.methods.calculateDiscount = function (subtotal) {
  let discount = 0;
  const type = String(this.discountType || "")
    .toLowerCase()
    .trim();

  if (type.includes("percent") || type.includes("%")) {
    discount = Math.round((subtotal * this.discountValue) / 100);
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (
    type.includes("fix") ||
    type.includes("flat") ||
    type.includes("amount")
  ) {
    discount = Math.min(this.discountValue, subtotal);
  } else {
    // Fallback: assume percentage if unknown
    discount = Math.round((subtotal * this.discountValue) / 100);
    if (this.maxDiscount > 0 && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  }

  return discount;
};

export default mongoose.model("Coupon", couponSchema);
