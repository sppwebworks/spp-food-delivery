import express from "express";
import {
  subscribe,
  unsubscribe,
  listSubscribers,
} from "../controllers/newsletterController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Public routes */
router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);

/* Admin-only */
router.get(
  "/list",
  protect,
  (req, res, next) => {
    if (req.user?.role !== "admin") {
      res.status(403);
      return next(new Error("Admin access required"));
    }
    next();
  },
  listSubscribers,
);

export default router;
