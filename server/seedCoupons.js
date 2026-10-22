import "dotenv/config";
import mongoose from "mongoose";
import Coupon from "./src/models/Coupon.js";

const COUPONS = [
  { code: "SAVE50", discountType: "flat", discountValue: 50, minOrderValue: 200, description: "Flat ₹50 OFF", maxUses: 0, maxDiscount: 0 },
  { code: "FIRST20", discountType: "percentage", discountValue: 20, minOrderValue: 300, description: "20% OFF", maxUses: 1000, maxDiscount: 150, isFirstOrderOnly: true },
  { code: "WELCOME", discountType: "flat", discountValue: 100, minOrderValue: 500, description: "₹100 OFF", maxUses: 0, maxDiscount: 0 },
  { code: "FREEDEL", discountType: "flat", discountValue: 50, minOrderValue: 150, description: "Free Delivery", maxUses: 0, maxDiscount: 0 },
  { code: "WEEKEND", discountType: "percentage", discountValue: 30, minOrderValue: 400, description: "30% OFF Weekend", maxUses: 500, maxDiscount: 200 },
  { code: "BIRYANI", discountType: "flat", discountValue: 75, minOrderValue: 250, description: "₹75 OFF on Biryani", maxUses: 0, maxDiscount: 0 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    await Coupon.deleteMany({});
    console.log("🧹 Cleared existing coupons");

    for (const c of COUPONS) {
      await Coupon.create({
        ...c,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }

    console.log(`🚀 Successfully inserted ${COUPONS.length} coupons!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seed();