/**
 * ============================================================
 * SUPPORT TICKET MODEL
 * ============================================================
 */

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    attachment: { type: String, default: "" }, // optional file URL
  },
  { timestamps: true },
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["delivery", "payment", "quality", "wrong_item", "refund", "other"],
      default: "other",
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    messages: [messageSchema],
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Auto-generate ticket number before saving
supportTicketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model("SupportTicket").countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Index for fast admin lookup
supportTicketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
