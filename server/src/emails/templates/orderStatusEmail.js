/**
 * ============================================================
 * ORDER STATUS EMAIL
 * ============================================================
 * Sent whenever order status changes. Different copy per status.
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

const STATUS_COPY = {
  confirmed: {
    emoji: "✅",
    title: "Order Confirmed",
    message: "We've confirmed your order and sent it to the kitchen.",
    accent: "#3b82f6",
  },
  preparing: {
    emoji: "👨‍🍳",
    title: "Preparing Your Order",
    message: "Our chefs are preparing your food fresh right now.",
    accent: "#8b5cf6",
  },
  out_for_delivery: {
    emoji: "🛵",
    title: "Out for Delivery",
    message: "Your order is on the way! Expect it soon.",
    accent: "#06b6d4",
  },
  delivered: {
    emoji: "🎉",
    title: "Delivered — Enjoy!",
    message: "Your order has been delivered. We hope you enjoy it!",
    accent: "#10b981",
  },
  cancelled: {
    emoji: "❌",
    title: "Order Cancelled",
    message:
      "Your order has been cancelled. If you were charged, you'll be refunded within 3–5 business days.",
    accent: "#ef4444",
  },
};

export const orderStatusEmail = ({ name, order, status }) => {
  const copy = STATUS_COPY[status] || {
    emoji: "📦",
    title: "Order Update",
    message: `Your order is now: ${status}`,
    accent: "#fc8019",
  };

  const body = `
    <div style="text-align:center;font-size:56px;line-height:1;margin-bottom:16px;">
      ${copy.emoji}
    </div>
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 8px;text-align:center;">
      ${copy.title}
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 22px;line-height:1.6;text-align:center;">
      Hi ${name}, ${copy.message}
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:18px;margin:22px 0;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:#93959f;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">
        Order ID
      </div>
      <div style="font-size:16px;font-weight:800;color:#282c3f;font-family:ui-monospace,Menlo,monospace;">
        #${String(order._id).slice(-8).toUpperCase()}
      </div>
    </div>

    ${
      status === "delivered"
        ? `
    <p style="font-size:14px;color:#686b78;margin:0 0 0;line-height:1.6;text-align:center;">
      Loved your meal? Rate your experience and help others discover great food.
    </p>
    `
        : ""
    }
  `;

  return {
    subject: `${copy.emoji} ${copy.title} — #${String(order._id).slice(-6).toUpperCase()}`,
    html: baseTemplate({
      preheader: copy.message,
      title: copy.title,
      body,
      ctaText: "View Order Details",
      ctaUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/orders/${order._id}`,
      accentColor: copy.accent,
    }),
  };
};

export default orderStatusEmail;
