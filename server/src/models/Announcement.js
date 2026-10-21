import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 120 },
    emoji: { type: String, default: "🎁", maxlength: 8 },
    ctaText: { type: String, default: "Order Now →", maxlength: 30 },
    ctaLink: { type: String, default: "/restaurants", maxlength: 200 },
    couponCode: { type: String, default: "" }, // Optional: shows "CODE: X"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Announcement", announcementSchema);
