/**
 * ============================================================
 * AUTH MIDDLEWARE — protect + adminOnly
 * ============================================================
 */

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/* ---------- protect — verifies JWT ---------- */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.userId).select(
      "-password",
    );

    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user no longer exists");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — invalid token");
  }
});

/* ---------- adminOnly — requires role="admin" ---------- */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Admin access required");
};

/* ---------- Alias — some files import as `admin` ---------- */
export const admin = adminOnly;
