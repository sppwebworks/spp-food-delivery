/**
 * ============================================================
 * NEWSLETTER CONTROLLER
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import Subscriber from "../models/Subscriber.js";
import { sendEmail } from "../config/mailer.js";
import {
  welcomeEmail,
  adminNotificationEmail,
} from "../utils/emailTemplates.js";
import { isValidEmail } from "../utils/helpers.js";

/* ============================================================
   POST /api/newsletter/subscribe
   ============================================================ */
export const subscribe = asyncHandler(async (req, res) => {
  const { email, source = "footer" } = req.body;

  if (!email?.trim()) {
    res.status(400);
    throw new Error("Email is required");
  }

  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }

  const existing = await Subscriber.findOne({ email: normalized });

  if (existing && existing.isActive) {
    return res.json({
      success: true,
      message: "You're already subscribed!",
      alreadySubscribed: true,
    });
  }

  let subscriber;

  if (existing) {
    existing.isActive = true;
    existing.unsubscribedAt = null;
    subscriber = await existing.save();
  } else {
    subscriber = await Subscriber.create({ email: normalized, source });
  }

  const totalSubscribers = await Subscriber.countDocuments({
    isActive: true,
  });

  // Fire-and-forget welcome email
  sendEmail({ to: normalized, ...welcomeEmail(normalized) }).catch((err) =>
    console.error("[welcome email]", err.message),
  );

  // Fire-and-forget admin notification
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      ...adminNotificationEmail(normalized, totalSubscribers),
    }).catch((err) => console.error("[admin email]", err.message));
  }

  res.status(201).json({
    success: true,
    message: "Thanks for subscribing! Check your inbox.",
    subscriber: {
      _id: subscriber._id,
      email: subscriber.email,
      createdAt: subscriber.createdAt,
    },
  });
});

/* ============================================================
   POST /api/newsletter/unsubscribe
   ============================================================ */
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const subscriber = await Subscriber.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!subscriber) {
    res.status(404);
    throw new Error("Email not found in our list");
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.json({ success: true, message: "You've been unsubscribed." });
});

/* ============================================================
   GET /api/newsletter/list (admin only)
   ============================================================ */
export const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({ isActive: true })
    .select("email source createdAt")
    .sort("-createdAt")
    .limit(500);

  res.json({ total: subscribers.length, subscribers });
});
