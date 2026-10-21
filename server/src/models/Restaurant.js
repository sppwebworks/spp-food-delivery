/**
 * ============================================================
 * RESTAURANT MODEL
 * ============================================================
 */

import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    image: {
      type: String,
      required: true,
    },
    cuisines: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one cuisine is required"],
    },
    address: {
      line1: { type: String, required: true, maxlength: 200 },
      line2: { type: String, default: "", maxlength: 200 },
      city: { type: String, required: true, maxlength: 50, index: true },
      pincode: { type: String, required: true, maxlength: 10 },
    },
    phone: { type: String, default: "", maxlength: 15 },

    // Display fields
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    deliveryTime: { type: Number, default: 30, min: 5, max: 120 }, // minutes
    priceForTwo: { type: Number, default: 400, min: 0 },
    offer: { type: String, default: "", maxlength: 80 },

    // Flags
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isVeg: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Text index for search
restaurantSchema.index({ name: "text", cuisines: "text" });

export default mongoose.model("Restaurant", restaurantSchema);
