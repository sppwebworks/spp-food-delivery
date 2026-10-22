import express from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/upload
 * Protected — requires admin auth
 * Body: multipart/form-data with field "image"
 * Returns: { url: "https://res.cloudinary.com/..." }
 */
router.post(
  "/",
  protect,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      res.status(403);
      return next(new Error("Admin access required"));
    }
    next();
  },
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    try {
      // ✅ Upload the buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "foodieapp" }, // Optional: organizes images in a folder
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
  }),
);

export default router;
