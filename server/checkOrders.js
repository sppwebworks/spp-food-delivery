import "dotenv/config";
import mongoose from "mongoose";
import Order from "./src/models/Order.js";

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find().sort("-createdAt").limit(1).lean();
  if (orders.length === 0) {
    console.log("❌ No orders found");
  } else {
    const o = orders[0];
    console.log("=== Latest Order ===");
    console.log(`  ID:         ${o._id}`);
    console.log(`  Status:     ${o.status}`);
    console.log(`  Restaurant: ${o.restaurant || "❌ MISSING"}`);
    console.log(`  User:       ${o.user}`);
    console.log(`  Total:      ₹${o.total}`);
  }
  await mongoose.disconnect();
  process.exit(0);
};

check();
