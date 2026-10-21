/**
 * ============================================================
 * ADMIN AUTH CONTROLLER
 * ============================================================
 *
 * POST /api/admin/login   → authenticate an admin user
 * GET  /api/admin/me      → verify current admin session
 *
 * Both reject non-admin users with 403.
 *
 * Why a separate login:
 *   - Customer tokens and admin tokens can't be mixed
 *   - Different rate limits
 *   - Different JWT audience (optional)
 *   - Clear separation of audit logs
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/* ---------- POST /api/admin/login ---------- */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  // Same "invalid credentials" message to avoid email enumeration
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: generateToken(user._id),
  });
});

/* ---------- GET /api/admin/me ---------- */
export const adminMe = asyncHandler(async (req, res) => {
  // `protect` already attached req.user
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required");
  }
  res.json(req.user);
});
