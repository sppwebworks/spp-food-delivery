import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  archiveOrder,
  unarchiveOrder,
  reorder,
  downloadInvoice,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getMyOrders).post(createOrder);

// ✅ IMPORTANT: /:id/invoice must come BEFORE /:id
router.get("/:id/invoice", downloadInvoice);

router.route("/:id").get(getOrderById);

router.put("/:id/status", updateOrderStatus);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/archive", archiveOrder);
router.put("/:id/unarchive", unarchiveOrder);
router.post("/:id/reorder", reorder);

export default router;
