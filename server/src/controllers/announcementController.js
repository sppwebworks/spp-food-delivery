import asyncHandler from "express-async-handler";
import Announcement from "../models/Announcement.js";

// PUBLIC: Get the active banner for the customer app
export const getActiveAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findOne({ isActive: true }).sort(
    "-createdAt",
  );
  res.json(announcement || null);
});

// ADMIN: Get all banners
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort("-createdAt");
  res.json(announcements);
});

// ADMIN: Create banner
export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create(req.body);
  res.status(201).json(announcement);
});

// ADMIN: Update banner
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  res.json(announcement);
});

// ADMIN: Delete banner
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});
