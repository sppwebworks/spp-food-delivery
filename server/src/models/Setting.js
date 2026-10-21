import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    /* ---------- Store ---------- */
    isStoreOpen: { type: Boolean, default: true },
    minOrderValue: { type: Number, default: 99 },
    deliveryFee: { type: Number, default: 30 },
    freeDeliveryThreshold: { type: Number, default: 499 },
    packagingFee: { type: Number, default: 10 },
    taxRate: { type: Number, default: 5 },
    currency: { type: String, default: "INR" },

    /* ---------- Announcement Bar (above navbar) ---------- */
    announcementEnabled: { type: Boolean, default: true },
    announcementText: {
      type: String,
      default: "50% OFF on your first order above ₹199",
      maxlength: 120,
    },
    announcementCtaText: {
      type: String,
      default: "Order Now →",
      maxlength: 30,
    },
    announcementCtaLink: {
      type: String,
      default: "/restaurants",
      maxlength: 200,
    },
    announcementEmoji: { type: String, default: "🎁", maxlength: 8 },
  },
  { timestamps: true },
);

settingSchema.statics.getSettings = async function () {
  let s = await this.findOne();
  if (!s) s = await this.create({});
  return s;
};

export default mongoose.model("Setting", settingSchema);
