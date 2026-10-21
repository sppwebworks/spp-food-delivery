import "dotenv/config";
import mongoose from "mongoose";
import Order from "./src/models/Order.js";
import Review from "./src/models/Review.js";

const cleanOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Delete orders without a restaurant
    const ordersResult = await Order.deleteMany({
      restaurant: { $exists: false },
    });
    console.log(
      `✅ Deleted ${ordersResult.deletedCount} orders without a restaurant field`,
    );

    // Delete any reviews that point to those deleted orders (orphaned reviews)
    const reviewsResult = await Review.deleteMany({
      order: { $exists: false },
    });
    console.log(`✅ Deleted ${reviewsResult.deletedCount} orphaned reviews`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

cleanOrders();
