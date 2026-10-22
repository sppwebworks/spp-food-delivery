/**
 * ============================================================
 * UPLOAD CONTROLLER (Cloudinary)
 * ============================================================
 * POST /api/upload  (admin only)
 * Accepts a single image, returns { url }
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  try {
    // ✅ Upload the file buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "foodieapp" }, // Optional: saves in a 'foodieapp' folder
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    // ✅ Return the permanent Cloudinary URL
    res.status(201).json({
      url: result.secure_url,
      public_id: result.public_id,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500);
    throw new Error("Failed to upload image");
  }
});
