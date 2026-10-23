import asyncHandler from "express-async-handler";
import DeliveryPartner from "../models/DeliveryPartner.js";

export const riderOnly = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorised");
  }
  const rider = await DeliveryPartner.findOne({ user: req.user._id });
  if (!rider) {
    res.status(403);
    throw new Error("Rider profile not found");
  }
  if (!rider.isApproved) {
    res.status(403);
    throw new Error("Your rider account is pending admin approval");
  }
  req.rider = rider;
  next();
});
