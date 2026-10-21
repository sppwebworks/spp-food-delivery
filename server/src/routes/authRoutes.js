import express from "express";
import {
  register,
  login,
  me,
  updateProfile,
  updatePassword,
  uploadAvatar,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.put("/me", protect, updateProfile);
router.put("/password", protect, updatePassword); // ✅ Added
router.post(
  "/upload-avatar",
  protect,
  avatarUpload.single("avatar"),
  uploadAvatar,
); // ✅ Added
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
