/**
 * ============================================================
 * WELCOME EMAIL
 * ============================================================
 * Sent on successful registration.
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

export const welcomeEmail = ({ name, email }) => {
  const body = `
    <h1 style="font-size:24px;font-weight:800;color:#282c3f;margin:0 0 8px;">
      Welcome, ${name}! 🎉
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 20px;line-height:1.6;">
      You're officially part of FoodieHub. Get ready for fast delivery, great offers, and delicious food from your favourite restaurants.
    </p>

    <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin:24px 0;">
      <p style="font-size:14px;font-weight:700;color:#282c3f;margin:0 0 12px;">
        What you can do right now:
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#282c3f;">
            🍕 &nbsp; Browse restaurants near you
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#282c3f;">
            🛒 &nbsp; Add items to your cart and checkout
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#282c3f;">
            🎟️ &nbsp; Use coupon <strong style="color:#fc8019;">SAVE50</strong> on your first order
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:14px;color:#686b78;margin:0;line-height:1.6;">
      We've sent this to <strong style="color:#282c3f;">${email}</strong>. If you didn't create this account, please ignore this email.
    </p>
  `;

  return {
    subject: `Welcome to FoodieHub, ${name}! 🎉`,
    html: baseTemplate({
      preheader: `Welcome, ${name}! Your FoodieHub account is ready.`,
      title: "Welcome to FoodieHub",
      body,
      ctaText: "Start Ordering",
      ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
      accentColor: "#fc8019",
    }),
  };
};

export default welcomeEmail;
