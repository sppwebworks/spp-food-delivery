import express from "express";
import {
  register,
  login,
  me,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js"; // ✅ Import Cloudinary

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/me", protect, updateProfile);
router.put("/password", protect, updatePassword);

/* ============================================================
   ✅ UPLOAD AVATAR (Cloudinary)
   ============================================================ */
router.post(
  "/upload-avatar",
  protect,
  avatarUpload.single("avatar"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    try {
      // Upload buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "spp-foodieapp/avatars" }, // Organize in a folder
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });

      // Update user in database
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.avatar = result.secure_url;
      await user.save();

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        avatar: result.secure_url,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (err) {
      console.error("Cloudinary avatar upload error:", err);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  },
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
