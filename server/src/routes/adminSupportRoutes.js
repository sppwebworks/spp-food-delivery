import express from "express";
import {
  adminGetTickets,
  adminGetTicketById,
  adminReply,
  adminUpdateStatus,
} from "../controllers/supportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", adminGetTickets);
router.get("/:id", adminGetTicketById);
router.post("/:id/reply", adminReply);
router.put("/:id/status", adminUpdateStatus);

export default router;
