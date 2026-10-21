import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  userReply,
} from "../controllers/supportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTicket);
router.get("/mine", getMyTickets);
router.get("/:id", getTicketById);
router.post("/:id/reply", userReply);

export default router;
