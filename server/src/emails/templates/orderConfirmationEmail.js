/**
 * ============================================================
 * ORDER CONFIRMATION EMAIL
 * ============================================================
 * Sent immediately after a successful order creation.
 * Includes full item list, totals, and delivery address.
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const orderConfirmationEmail = ({ name, order }) => {
  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e9e9eb;">
          <div style="font-size:14px;font-weight:600;color:#282c3f;">
            ${it.name}
          </div>
          <div style="font-size:12px;color:#93959f;margin-top:2px;">
            ₹${it.price} × ${it.quantity}
          </div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e9e9eb;text-align:right;font-size:14px;font-weight:700;color:#282c3f;white-space:nowrap;">
          ₹${it.price * it.quantity}
        </td>
      </tr>
    `,
    )
    .join("");

  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 6px;">
      Order confirmed! 🎉
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 20px;line-height:1.6;">
      Thanks ${name} — we've received your order and it's on its way to being prepared.
    </p>

    <div style="background:#fc8019;color:#fff;padding:14px 18px;border-radius:10px;margin-bottom:22px;">
      <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;font-weight:700;opacity:0.85;margin-bottom:2px;">
        Order ID
      </div>
      <div style="font-size:16px;font-weight:800;font-family:ui-monospace,Menlo,monospace;">
        #${String(order._id).slice(-8).toUpperCase()}
      </div>
    </div>

    <h2 style="font-size:14px;font-weight:800;color:#282c3f;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.6px;">
      Items
    </h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${itemsRows}
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#686b78;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#282c3f;text-align:right;">${formatCurrency(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#686b78;">Delivery Fee</td>
        <td style="padding:6px 0;font-size:14px;color:#282c3f;text-align:right;">${formatCurrency(order.deliveryFee)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#686b78;">Tax</td>
        <td style="padding:6px 0;font-size:14px;color:#282c3f;text-align:right;">${formatCurrency(order.tax)}</td>
      </tr>
      ${
        order.discount > 0
          ? `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#10b981;">Discount</td>
        <td style="padding:6px 0;font-size:14px;color:#10b981;text-align:right;">− ${formatCurrency(order.discount)}</td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding:14px 0 0;font-size:15px;font-weight:800;color:#282c3f;border-top:2px solid #e9e9eb;">Total</td>
        <td style="padding:14px 0 0;font-size:18px;font-weight:800;color:#fc8019;text-align:right;border-top:2px solid #e9e9eb;">${formatCurrency(order.total)}</td>
      </tr>
    </table>

    <div style="background:#f9f9f9;border-radius:10px;padding:18px;margin:26px 0 0;">
      <div style="font-size:11px;font-weight:700;color:#93959f;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:6px;">
        Delivery Address
      </div>
      <div style="font-size:14px;color:#282c3f;line-height:1.6;font-weight:600;">
        ${order.address?.label || "Home"}
      </div>
      <div style="font-size:13px;color:#686b78;line-height:1.6;">
        ${order.address?.line1 || ""}<br/>
        ${order.address?.line2 ? order.address.line2 + "<br/>" : ""}
        ${order.address?.city || ""} — ${order.address?.pincode || ""}<br/>
        📞 ${order.phone || ""}
      </div>
    </div>

    <p style="font-size:14px;color:#686b78;margin:22px 0 0;line-height:1.6;">
      You'll get another email as soon as your order status changes.
    </p>
  `;

  return {
    subject: `🎉 Order Confirmed — #${String(order._id).slice(-6).toUpperCase()}`,
    html: baseTemplate({
      preheader: `Your FoodieHub order #${String(order._id).slice(-6).toUpperCase()} is confirmed.`,
      title: "Order Confirmation",
      body,
      ctaText: "Track Your Order",
      ctaUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/orders/${order._id}`,
      accentColor: "#fc8019",
    }),
  };
};

export default orderConfirmationEmail;
