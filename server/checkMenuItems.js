/**
 * ============================================================
 * DIAGNOSTIC: Check MenuItem.restaurant Field
 * ============================================================
 * This script checks if your menu items are correctly linked to
 * a restaurant in MongoDB. If they are missing the restaurant ID,
 * orders will fail to attach to a restaurant, and reviews will fail.
 */

import "dotenv/config";
import mongoose from "mongoose";
import MenuItem from "./src/models/MenuItem.js";
import Restaurant from "./src/models/Restaurant.js";

const checkMenuItems = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    const totalItems = await MenuItem.countDocuments();
    const withRestaurant = await MenuItem.countDocuments({
      restaurant: { $exists: true, $ne: null },
    });
    const withoutRestaurant = totalItems - withRestaurant;

    console.log("=== MENU ITEM ANALYSIS ===");
    console.log(`Total menu items:      ${totalItems}`);
    console.log(`With restaurant field: ${withRestaurant}`);
    console.log(`Missing restaurant:    ${withoutRestaurant}\n`);

    if (totalItems === 0) {
      console.log(
        "⚠️  No menu items in the database. Run: node seedRestaurants.js",
      );
      process.exit(0);
    }

    if (withoutRestaurant === 0) {
      console.log("✅ ALL menu items are correctly linked to a restaurant!");
      console.log("   Reviews should work correctly for new orders.");
    } else {
      console.log("❌ BUG FOUND: Some menu items have NO restaurant attached.");
      console.log("   This is why orders save 'restaurant: undefined'.");
      console.log(
        "   This is why reviews fail with 'order doesn't have a restaurant'.\n",
      );
    }

    // Show sample of an item WITH restaurant
    if (withRestaurant > 0) {
      const good = await MenuItem.findOne({ restaurant: { $exists: true } })
        .populate("restaurant", "name")
        .lean();
      if (good) {
        console.log("=== SAMPLE ITEM WITH RESTAURANT (GOOD) ===");
        console.log(`  Name:       ${good.name}`);
        console.log(`  Price:      ₹${good.price}`);
        console.log(
          `  Restaurant: ${good.restaurant?.name || "?"} (${good.restaurant?._id})`,
        );
        console.log("");
      }
    }

    // Show sample of an item WITHOUT restaurant
    if (withoutRestaurant > 0) {
      const bad = await MenuItem.findOne({
        $or: [{ restaurant: { $exists: false } }, { restaurant: null }],
      }).lean();
      if (bad) {
        console.log("=== SAMPLE ITEM WITHOUT RESTAURANT (BAD) ===");
        console.log(`  Name:       ${bad.name}`);
        console.log(`  Price:      ₹${bad.price}`);
        console.log(`  Restaurant: ❌ MISSING`);
        console.log(`  Full keys:  ${Object.keys(bad).join(", ")}`);
      }
    }

    // List restaurants and their item counts
    console.log("\n=== RESTAURANTS ===");
    const restaurants = await Restaurant.find().lean();
    for (const r of restaurants) {
      const count = await MenuItem.countDocuments({ restaurant: r._id });
      console.log(`  ${r.name.padEnd(25)} → ${count} items`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkMenuItems();
