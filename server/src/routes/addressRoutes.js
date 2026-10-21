import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All address routes require auth
router.use(protect);

router.route("/").get(getAddresses).post(createAddress);
router.route("/:id").put(updateAddress).delete(deleteAddress);

export default router;
