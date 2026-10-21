import asyncHandler from "express-async-handler";
import Address from "../models/Address.js";

/* ---------- LIST ---------- */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort(
    "-isDefault -createdAt",
  );
  res.json(addresses);
});

/* ---------- CREATE ---------- */
export const createAddress = asyncHandler(async (req, res) => {
  const { label, line1, line2, city, pincode, isDefault } = req.body;

  if (!line1?.trim() || !city?.trim() || !pincode?.trim()) {
    res.status(400);
    throw new Error("Line1, city and pincode are required");
  }

  const count = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = isDefault || count === 0;

  // If this is the default, unset others
  if (shouldBeDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    label: label?.trim() || "Home",
    line1: line1.trim(),
    line2: line2?.trim() || "",
    city: city.trim(),
    pincode: pincode.trim(),
    isDefault: shouldBeDefault,
  });

  res.status(201).json(address);
});

/* ---------- UPDATE ---------- */
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  const { label, line1, line2, city, pincode, isDefault } = req.body;

  if (isDefault) {
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: address._id } },
      { isDefault: false },
    );
  }

  Object.assign(address, {
    label: label ?? address.label,
    line1: line1 ?? address.line1,
    line2: line2 ?? address.line2,
    city: city ?? address.city,
    pincode: pincode ?? address.pincode,
    isDefault: isDefault ?? address.isDefault,
  });

  await address.save();
  res.json(address);
});

/* ---------- DELETE ---------- */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  res.json({ message: "Address deleted" });
});
