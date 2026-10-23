import express from "express";
import {
  listRiders,
  createRider,
  approveRider,
  rejectRider,
  assignRiderToOrder,
  availableRidersForOrder,
} from "../controllers/adminRiderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/riders", listRiders);
router.post("/riders", createRider);
router.put("/riders/:id/approve", approveRider);
router.put("/riders/:id/reject", rejectRider);

router.get("/orders/:id/available-riders", availableRidersForOrder);
router.put("/orders/:id/assign-rider", assignRiderToOrder);

export default router;
