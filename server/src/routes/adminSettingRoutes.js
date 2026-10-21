import express from "express";
import {
  getAdminSettings,
  updateSettings,
} from "../controllers/settingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getAdminSettings);
router.put("/", updateSettings);

export default router;
