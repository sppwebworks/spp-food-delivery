import express from "express";
import {
  getActiveAnnouncement,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // ✅ Uses existing middleware

const router = express.Router();

// Customer Route
router.get("/active", getActiveAnnouncement);

// Admin Routes
router.use(protect, admin); // ✅ Uses protect + admin from authMiddleware
router.route("/").get(getAllAnnouncements).post(createAnnouncement);
router.route("/:id").put(updateAnnouncement).delete(deleteAnnouncement);

export default router;
