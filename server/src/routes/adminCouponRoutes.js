import express from "express";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  next();
};

router.use(protect, adminOnly);
router.get("/", listCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
export default router;
