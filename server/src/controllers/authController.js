import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../config/mailer.js"; // Use your sendEmail util

/* ---------- REGISTER ---------- */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    res.status(409);
    throw new Error("Email already in use");
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || "",
    password: hashed,
  });

  res.status(201).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    token: generateToken(user._id),
  });
});

/* ---------- LOGIN ---------- */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
    token: generateToken(user._id),
  });
});

/* ---------- ME ---------- */
export const me = asyncHandler(async (req, res) => {
  res.json(req.user);
});

/* ---------- UPDATE PROFILE ---------- */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: name?.trim() || req.user.name,
      phone: phone?.trim() || req.user.phone,
    },
    { new: true, runValidators: true },
  ).select("-password");
  res.json(user);
});

/* ---------- UPDATE PASSWORD ---------- */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new password are required");
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

/* ---------- FORGOT PASSWORD (Send 6-digit OTP) ---------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error("Email not found");
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save to DB (expires in 10 minutes)
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  // Send Email using your existing mailer
  await sendEmail({
    to: user.email,
    subject: "Password Reset Code - SPP FoodieApp",
    html: `
      <h2>Password Reset Request</h2>
      <p>Your 6-digit reset code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #fc8019;">${otp}</h1>
      <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
    `,
  });

  res.json({ message: "Reset code sent to email" });
});

/* ---------- RESET PASSWORD (Verify OTP & Save New Password) ---------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Find user by email, OTP, and ensure it hasn't expired
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset code");
  }

  // Set new password
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful. Please login." });
});
