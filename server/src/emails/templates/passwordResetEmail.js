/**
 * ============================================================
 * PASSWORD RESET EMAIL
 * ============================================================
 * Sent when a user requests a password reset.
 * Token expires in 1 hour.
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

export const passwordResetEmail = ({
  name,
  resetUrl,
  expiresIn = "1 hour",
}) => {
  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 8px;">
      Reset your password 🔑
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 22px;line-height:1.6;">
      Hi ${name}, we received a request to reset the password for your FoodieHub account.
    </p>

    <div style="background:#fff7ed;border-left:4px solid #fc8019;border-radius:6px;padding:14px 18px;margin:22px 0;">
      <p style="font-size:13px;color:#9a3412;margin:0;line-height:1.6;">
        <strong>This link expires in ${expiresIn}.</strong> If you didn't request this, you can safely ignore this email — your password won't change.
      </p>
    </div>

    <p style="font-size:14px;color:#686b78;margin:22px 0 0;line-height:1.6;">
      For security, we never include your password in emails. If you need help, contact our support team.
    </p>
  `;

  return {
    subject: "🔑 Reset your FoodieHub password",
    html: baseTemplate({
      preheader: "Reset your FoodieHub password — link expires in 1 hour.",
      title: "Password Reset",
      body,
      ctaText: "Reset Password",
      ctaUrl: resetUrl,
      accentColor: "#3b82f6",
    }),
  };
};

export default passwordResetEmail;
