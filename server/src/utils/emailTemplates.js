/**
 * ============================================================
 * EMAIL TEMPLATES
 * ============================================================
 */

const BRAND_COLOR = "#fc8019";
const APP_NAME = "SPP FoodieApp";
const APP_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* ---------- Base layout wrapper ---------- */
const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; padding:0; background:#f5f7fb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#0f172a; }
    .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 12px 32px rgba(15,23,42,0.08); }
    .header { background:linear-gradient(135deg,${BRAND_COLOR},#e56f0e); padding:32px 32px 28px; color:#fff; text-align:center; }
    .header h1 { margin:0; font-size:26px; font-weight:800; letter-spacing:-0.4px; }
    .header p { margin:6px 0 0; font-size:14px; opacity:0.9; }
    .body { padding:32px; line-height:1.6; font-size:15px; }
    .body h2 { margin:0 0 12px; font-size:20px; color:#0f172a; }
    .body p { margin:0 0 16px; color:#475569; }
    .cta { display:inline-block; background:${BRAND_COLOR}; color:#fff !important; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:700; font-size:14px; margin:12px 0 20px; }
    .footer { background:#0f172a; padding:24px 32px; text-align:center; color:#94a3b8; font-size:12px; }
    .footer a { color:${BRAND_COLOR}; text-decoration:none; }
    .divider { height:1px; background:#e2e8f0; margin:24px 0; }
    .badge { display:inline-block; background:rgba(252,128,25,0.12); color:${BRAND_COLOR}; font-size:12px; font-weight:700; padding:6px 12px; border-radius:20px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>🍽️ ${APP_NAME}</h1>
      <p>Good food. Great mood.</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} ${APP_NAME} · <a href="${APP_URL}">Visit site</a><br/>
      You're receiving this because you subscribed on ${APP_NAME}.
    </div>
  </div>
</body>
</html>
`;

/* ---------- Welcome email to subscriber ---------- */
export const welcomeEmail = (email) => ({
  subject: `Welcome to ${APP_NAME} 🎉`,
  html: layout(`
    <span class="badge">SUBSCRIBED</span>
    <h2 style="margin-top:16px;">You're on the list!</h2>
    <p>Thanks for subscribing to <strong>${APP_NAME}</strong>. We'll send you exclusive offers, new restaurant alerts, and handpicked food recommendations.</p>
    <p>To kick things off, here's <strong>50% OFF</strong> your first order above ₹199:</p>
    <p style="text-align:center;"><a href="${APP_URL}/restaurants" class="cta">Order Now</a></p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">You subscribed with <strong>${email}</strong>. If this wasn't you, ignore this email.</p>
  `),
  text: `Welcome to ${APP_NAME}! Thanks for subscribing. Order now: ${APP_URL}/restaurants`,
});

/* ---------- Admin notification ---------- */
export const adminNotificationEmail = (subscriberEmail, total) => ({
  subject: `🎉 New subscriber: ${subscriberEmail}`,
  html: layout(`
    <span class="badge">NEW SUBSCRIBER</span>
    <h2 style="margin-top:16px;">You just gained a subscriber</h2>
    <p><strong>${subscriberEmail}</strong> joined your newsletter.</p>
    <p style="background:#f5f7fb;padding:16px;border-radius:10px;font-family:monospace;font-size:13px;color:#0f172a;">
      Total active subscribers: <strong>${total}</strong>
    </p>
    <p><a href="${APP_URL}" class="cta">Open Admin</a></p>
  `),
  text: `New subscriber: ${subscriberEmail}. Total: ${total}`,
});

/* ---------- Order confirmation (for later use) ---------- */
export const orderConfirmationEmail = (order) => ({
  subject: `Order #${order._id?.slice(-6).toUpperCase()} confirmed ✅`,
  html: layout(`
    <span class="badge">ORDER CONFIRMED</span>
    <h2 style="margin-top:16px;">Your order is on the way</h2>
    <p>Thanks for your order! We'll keep you posted on delivery.</p>
    <p style="background:#f5f7fb;padding:16px;border-radius:10px;">
      <strong>Order #${order._id?.slice(-6).toUpperCase()}</strong><br/>
      Total: ₹${order.total}<br/>
      Items: ${order.items?.length || 0}
    </p>
    <p><a href="${APP_URL}/orders/${order._id}" class="cta">Track Order</a></p>
  `),
  text: `Order confirmed. Total: ₹${order.total}`,
});
