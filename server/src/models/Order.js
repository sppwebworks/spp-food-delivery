import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    mealId: String,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 30 },
    packagingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    total: { type: Number, required: true },
    address: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      pincode: String,
    },
    phone: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "stripe", "razorpay", "phonepe"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentGateway: { type: String, default: "" },
    paymentId: { type: String, default: "" },
    paymentIntentId: { type: String, default: "" },
    razorpayOrderId: { type: String, default: "" },
    phonepeMerchantOrderId: { type: String, default: "" },
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: 0 },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
    refundedAt: { type: Date, default: null },

    /* DELIVERY PARTNER */
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
      index: true,
    },
    assignedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    deliveryOtp: { type: String, default: null },
    deliveryOtpVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    estimatedDelivery: Date,
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
