/**
 * ============================================================
 * SUBSCRIBER MODEL
 * ============================================================
 */

import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    source: {
      type: String,
      default: "footer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Subscriber", subscriberSchema);
