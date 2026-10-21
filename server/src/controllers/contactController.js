/**
 * ============================================================
 * CONTACT CONTROLLER
 * ============================================================
 * POST /api/contact
 *
 * Sends two emails:
 *   1. Internal notification to support team
 *   2. Auto-reply confirmation to the user
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import {
  sendAsync,
  contactAdminEmail,
  contactUserEmail,
} from "../emails/index.js";

export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400);
    throw new Error("Name, email and message are required");
  }
  if (message.length > 2000) {
    res.status(400);
    throw new Error("Message is too long (max 2000 characters)");
  }

  const finalSubject = subject?.trim() || "General Inquiry";

  // 1. Notify support team
  const admin = contactAdminEmail({
    name: name.trim(),
    email: email.trim(),
    subject: finalSubject,
    message: message.trim(),
  });
  sendAsync({
    to: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
    subject: admin.subject,
    html: admin.html,
    replyTo: email.trim(),
  });

  // 2. Auto-reply to user
  const userAutoReply = contactUserEmail({
    name: name.trim(),
    subject: finalSubject,
  });
  sendAsync({
    to: email.trim(),
    subject: userAutoReply.subject,
    html: userAutoReply.html,
  });

  res.json({ success: true, message: "Message received" });
});
