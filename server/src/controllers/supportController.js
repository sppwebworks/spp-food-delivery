/**
 * ============================================================
 * SUPPORT CONTROLLER
 * ============================================================
 */

import asyncHandler from "express-async-handler";
import SupportTicket from "../models/SupportTicket.js";
import Order from "../models/Order.js";
import {
  sendAsync,
  customerSupportReplyEmail,
  adminSupportReplyEmail,
} from "../emails/index.js";
import { getIO } from "../config/socket.js";

/* ============================================================
   USER — CREATE TICKET
   ============================================================ */
export const createTicket = asyncHandler(async (req, res) => {
  const { orderId, category, subject, description } = req.body;

  if (!subject?.trim()) {
    res.status(400);
    throw new Error("Subject is required");
  }
  if (!description?.trim()) {
    res.status(400);
    throw new Error("Description is required");
  }
  if (description.length < 10) {
    res.status(400);
    throw new Error("Please provide more detail (at least 10 characters)");
  }

  let order = null;
  if (orderId) {
    order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    order: order?._id,
    category: category || "other",
    subject: subject.trim(),
    description: description.trim(),
    messages: [
      {
        sender: "user",
        senderId: req.user._id,
        message: description.trim(),
      },
    ],
  });

  // Socket notification to admins
  try {
    getIO().to("admin").emit("ticket:created", {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      user: req.user.name,
    });
  } catch (err) {
    console.error("Socket emit failed:", err.message);
  }

  // ✅ Send Email to Admin (strictly from .env)
  try {
    const { subject, html } = adminSupportReplyEmail({
      customerName: req.user.name,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      replyMessage: description.trim(),
      ticketId: ticket._id,
    });

    sendAsync({ to: process.env.SUPPORT_EMAIL, subject, html });
  } catch (err) {
    console.error("Email send failed:", err);
  }

  res.status(201).json({
    success: true,
    message: `Ticket ${ticket.ticketNumber} created.`,
    ticket,
  });
});

/* ============================================================
   USER — REPLY
   ============================================================ */
export const userReply = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  const ticket = await SupportTicket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  if (ticket.status === "closed") {
    res.status(400);
    throw new Error("This ticket is closed.");
  }

  ticket.messages.push({
    sender: "user",
    senderId: req.user._id,
    message: message.trim(),
  });

  if (ticket.status === "resolved") {
    ticket.status = "open";
  }

  await ticket.save();

  // Socket notification to admins
  try {
    getIO().to("admin").emit("ticket:replied", {
      ticketId: ticket._id,
      sender: "user",
      message: message.trim(),
    });
  } catch (err) {}

  // ✅ Send Email to Admin (strictly from .env)
  try {
    const { subject, html } = adminSupportReplyEmail({
      customerName: req.user.name,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      replyMessage: message.trim(),
      ticketId: ticket._id,
    });

    sendAsync({ to: process.env.SUPPORT_EMAIL, subject, html });
  } catch (err) {}

  res.json({ success: true, ticket });
});

/* ============================================================
   ADMIN — REPLY
   ============================================================ */
export const adminReply = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  const ticket = await SupportTicket.findById(req.params.id).populate("user");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.messages.push({
    sender: "admin",
    senderId: req.user._id,
    message: message.trim(),
  });

  if (ticket.status === "open") {
    ticket.status = "in_progress";
  }

  await ticket.save();

  // Socket notification to customer
  try {
    getIO().to(`user:${ticket.user._id}`).emit("ticket:replied", {
      ticketId: ticket._id,
      sender: "admin",
      message: message.trim(),
    });
  } catch (err) {}

  // ✅ Send Email to Customer
  try {
    const { subject, html } = customerSupportReplyEmail({
      name: ticket.user.name,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      replyMessage: message.trim(),
      ticketId: ticket._id,
    });
    sendAsync({ to: ticket.user.email, subject, html });
  } catch (err) {}

  res.json({ success: true, ticket });
});

/* ============================================================
   OTHER ENDPOINTS (LIST, GET, STATUS)
   ============================================================ */
export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .populate("order", "total status createdAt")
    .sort("-createdAt")
    .limit(50);
  res.json({ tickets });
});

export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("order", "total status createdAt");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  res.json(ticket);
});

export const adminGetTickets = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate("user", "name email phone avatar")
      .populate("order", "total status createdAt")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
    SupportTicket.countDocuments(filter),
  ]);

  res.json({
    tickets,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

export const adminGetTicketById = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id)
    .populate("user", "name email phone avatar")
    .populate("order", "total status createdAt items address");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  res.json(ticket);
});

export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const valid = ["open", "in_progress", "resolved", "closed"];
  if (!valid.includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const ticket = await SupportTicket.findById(req.params.id).populate("user");
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.status = status;
  if (status === "resolved" || status === "closed") {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = req.user._id;
  }

  await ticket.save();

  try {
    getIO().to(`user:${ticket.user._id}`).emit("ticket:status", {
      ticketId: ticket._id,
      status,
    });
  } catch (err) {}

  res.json({ success: true, ticket });
});
