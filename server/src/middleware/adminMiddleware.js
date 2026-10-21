/**
 * ============================================================
 * ADMIN MIDDLEWARE
 * ============================================================
 * Protects routes so that only users with the "admin" role
 * can access them.
 *
 * ⚠️ IMPORTANT: This must be used AFTER the `protect` middleware.
 * Example: router.use(protect, adminOnly);
 * ============================================================
 */

export const adminOnly = (req, res, next) => {
  // Check if the user is logged in AND has the admin role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Admin access required");
  }
};

// Default export for backwards compatibility if needed
export default adminOnly;
