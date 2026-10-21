/**
 * ============================================================
 * LOGIN ALERT EMAIL
 * ============================================================
 * Sent when a user logs in (optional — throttle in production).
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

export const loginAlertEmail = ({ name, time, ip, device }) => {
  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 8px;">
      New login detected 🔐
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 22px;line-height:1.6;">
      Hi ${name}, we noticed a new sign-in to your FoodieHub account.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9f9f9;border-radius:10px;padding:0;overflow:hidden;">
      <tr>
        <td style="padding:14px 18px;font-size:13px;color:#686b78;border-bottom:1px solid #e9e9eb;width:120px;font-weight:600;">
          Time
        </td>
        <td style="padding:14px 18px;font-size:13px;color:#282c3f;border-bottom:1px solid #e9e9eb;font-weight:600;">
          ${time}
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;font-size:13px;color:#686b78;border-bottom:1px solid #e9e9eb;font-weight:600;">
          IP Address
        </td>
        <td style="padding:14px 18px;font-size:13px;color:#282c3f;border-bottom:1px solid #e9e9eb;font-family:ui-monospace,Menlo,monospace;">
          ${ip || "Not available"}
        </td>
      </tr>
      <tr>
        <td style="padding:14px 18px;font-size:13px;color:#686b78;font-weight:600;">
          Device
        </td>
        <td style="padding:14px 18px;font-size:13px;color:#282c3f;">
          ${device || "Unknown"}
        </td>
      </tr>
    </table>

    <p style="font-size:14px;color:#686b78;margin:24px 0 0;line-height:1.6;">
      If this was you, no action needed. If you don't recognize this activity, please
      <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/profile" style="color:#fc8019;font-weight:600;text-decoration:none;">secure your account</a> immediately.
    </p>
  `;

  return {
    subject: "🔐 New login to your FoodieHub account",
    html: baseTemplate({
      preheader: `New login detected on your FoodieHub account.`,
      title: "Login Alert",
      body,
      accentColor: "#3b82f6",
    }),
  };
};

export default loginAlertEmail;
