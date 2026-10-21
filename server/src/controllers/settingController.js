import asyncHandler from "express-async-handler";
import Setting from "../models/Setting.js";

/* ============================================================
   PUBLIC — GET /api/settings
   ============================================================ */
export const getPublicSettings = asyncHandler(async (req, res) => {
  const s = await Setting.getSettings();
  res.json({
    isStoreOpen: s.isStoreOpen,
    minOrderValue: s.minOrderValue,
    deliveryFee: s.deliveryFee,
    freeDeliveryThreshold: s.freeDeliveryThreshold,
    packagingFee: s.packagingFee,
    taxRate: s.taxRate,
    currency: s.currency,

    announcementEnabled: s.announcementEnabled,
    announcementText: s.announcementText,
    announcementCtaText: s.announcementCtaText,
    announcementCtaLink: s.announcementCtaLink,
    announcementEmoji: s.announcementEmoji,
  });
});

/* ============================================================
   ADMIN — GET /api/admin/settings
   ============================================================ */
export const getAdminSettings = asyncHandler(async (req, res) => {
  const s = await Setting.getSettings();
  res.json(s);
});

/* ============================================================
   ADMIN — PUT /api/admin/settings
   ============================================================ */
export const updateSettings = asyncHandler(async (req, res) => {
  const allowed = [
    "isStoreOpen",
    "minOrderValue",
    "deliveryFee",
    "freeDeliveryThreshold",
    "packagingFee",
    "taxRate",
    "currency",
    "announcementEnabled",
    "announcementText",
    "announcementCtaText",
    "announcementCtaLink",
    "announcementEmoji",
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const s = await Setting.getSettings();
  Object.assign(s, updates);
  await s.save();
  res.json(s);
});
