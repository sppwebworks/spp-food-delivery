import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendAsync, welcomeEmail, loginAlertEmail } from "../emails/index.js";

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

  const { subject, html } = welcomeEmail({
    name: user.name,
    email: user.email,
  });
  sendAsync({ to: user.email, subject, html });

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

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.role === "customer") {
    const { subject, html } = loginAlertEmail({
      name: user.name,
      time: new Date().toLocaleString("en-IN"),
      ip: req.ip,
      device: req.headers["user-agent"]?.slice(0, 80),
    });
    sendAsync({ to: user.email, subject, html });
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
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

/* ---------- UPLOAD AVATAR ---------- */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

  user.avatar = avatarUrl;
  await user.save();

  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    avatar: avatarUrl,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
    },
  });
});

/* ---------- FORGOT PASSWORD ---------- */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error("Email not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  sendAsync({
    to: user.email,
    subject: "Password Reset Code",
    html: `<h1>Reset Code: ${otp}</h1><p>This code expires in 10 minutes.</p>`,
  });

  res.json({ message: "Reset code sent to email" });
});

/* ---------- RESET PASSWORD ---------- */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordToken: otp,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset code");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful. Please login." });
});
