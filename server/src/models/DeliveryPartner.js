import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    phone: { type: String, required: true },
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "car"],
      default: "bike",
    },
    vehicleNumber: { type: String, default: "" },
    isOnline: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
      index: true,
    },
    currentLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

deliveryPartnerSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model("DeliveryPartner", deliveryPartnerSchema);
