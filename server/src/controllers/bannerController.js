import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";

/* PUBLIC — GET ACTIVE BANNERS */
export const getActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $and: [
      {
        $or: [{ startDate: { $exists: false } }, { startDate: { $lte: now } }],
      },
      { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
    ],
  });
  res.json({
    top: banners.find((b) => b.type === "top") || null,
    hero: banners.find((b) => b.type === "hero") || null,
  });
});

/* ADMIN — LIST ALL BANNERS */
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort("-createdAt");
  res.json(banners);
});

/* ADMIN — CREATE */
export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
});

/* ADMIN — UPDATE */
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  res.json(banner);
});

/* ADMIN — DELETE */
export const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner deleted" });
});
