/**
 * ============================================================
 * MENU ITEM MODEL
 * ============================================================
 */

import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 300,
    },
    image: { type: String, default: "" },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: { type: Number, default: 0, min: 0 }, // for strikethrough price
    category: {
      type: String,
      required: true,
      default: "Recommended",
      maxlength: 50,
      index: true,
    },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true, index: true },
    isRecommended: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // sort within category
  },
  { timestamps: true },
);

export default mongoose.model("MenuItem", menuItemSchema);
