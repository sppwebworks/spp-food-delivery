import express from "express";
import {
  listOrders,
  getOrder,
  updateStatus,
  getStats,
  listUsers,
} from "../controllers/adminController.js";
import { adminLogin, adminMe } from "../controllers/adminAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Admin-only middleware.
 * Must run AFTER `protect` so req.user exists.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  next();
};

/* ============================================================
   PUBLIC admin auth routes (no token required)
   ============================================================ */
router.post("/login", adminLogin);

/* ============================================================
   PROTECTED admin routes (token + admin role required)
   ============================================================ */
router.get("/me", protect, adminMe);

// Apply admin restriction to all routes below this point
router.use(protect, adminOnly);

/* ============================================================
   ✅ CRITICAL FIX: /stats MUST be defined BEFORE /:id
   ============================================================ */
router.get("/stats", getStats);

/* ---------- Orders ---------- */
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.put("/orders/:id/status", updateStatus);

/* ---------- Users ---------- */
router.get("/users", listUsers);

export default router;
