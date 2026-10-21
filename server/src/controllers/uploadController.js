/**
 * ============================================================
 * UPLOAD CONTROLLER
 * ============================================================
 * POST /api/upload  (admin only)
 * Accepts a single image, returns { url }
 * ============================================================
 */

import asyncHandler from "express-async-handler";

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  // Build absolute URL — uses the request host so it works in dev + prod
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});
