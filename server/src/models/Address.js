import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      default: "Home",
      maxlength: 20,
    },
    line1: {
      type: String,
      required: true,
      maxlength: 200,
    },
    line2: {
      type: String,
      default: "",
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      maxlength: 50,
    },
    pincode: {
      type: String,
      required: true,
      maxlength: 10,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Address", addressSchema);
