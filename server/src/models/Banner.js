import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["top", "hero"],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    subtitle: { type: String, maxlength: 200, default: "" },
    image: { type: String, default: "" },
    ctaText: { type: String, maxlength: 40, default: "Order Now →" },
    ctaLink: { type: String, maxlength: 200, default: "/restaurants" },
    couponCode: { type: String, maxlength: 30, default: "" },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Banner", bannerSchema);
