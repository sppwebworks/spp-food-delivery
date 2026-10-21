import express from "express";
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public route — used by the customer app
router.get("/active", getActiveBanners);

// Admin-only routes
router.use(protect, adminOnly);
router.route("/").get(getAllBanners).post(createBanner);
router.route("/:id").put(updateBanner).delete(deleteBanner);

export default router;
