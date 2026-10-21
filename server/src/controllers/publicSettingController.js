import asyncHandler from "express-async-handler";
import Setting from "../models/Setting.js";

// GET /api/settings (Public)
export const getPublicSettings = asyncHandler(async (req, res) => {
  // ✅ Fetch the actual settings from MongoDB
  const settings = await Setting.getSettings();

  // ✅ Return the ACTUAL values from the database
  res.json({
    isStoreOpen: settings.isStoreOpen,
    deliveryFee: settings.deliveryFee,
    taxRate: settings.taxRate,
    minOrderValue: settings.minOrderValue,
    storeName: settings.storeName,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    packagingFee: settings.packagingFee,
  });
});
