/**
 * ============================================================
 * CONTACT-US EMAIL
 * ============================================================
 * Two variants:
 *   - toAdmin: internal notification about a new message
 *   - toUser:  auto-reply confirmation to the sender
 * ============================================================
 */

import baseTemplate from "./baseTemplate.js";

/* ---------- Internal notification ---------- */
export const contactAdminEmail = ({ name, email, subject, message }) => {
  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 6px;">
      📬 New Contact Message
    </h1>
    <p style="font-size:14px;color:#686b78;margin:0 0 22px;">
      Someone submitted a message via the contact form.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9f9f9;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:12px 18px;font-size:12px;color:#93959f;font-weight:700;text-transform:uppercase;width:100px;border-bottom:1px solid #e9e9eb;">Name</td>
        <td style="padding:12px 18px;font-size:14px;color:#282c3f;font-weight:600;border-bottom:1px solid #e9e9eb;">${name}</td>
      </tr>
      <tr>
        <td style="padding:12px 18px;font-size:12px;color:#93959f;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e9e9eb;">Email</td>
        <td style="padding:12px 18px;font-size:14px;color:#282c3f;border-bottom:1px solid #e9e9eb;">
          <a href="mailto:${email}" style="color:#fc8019;text-decoration:none;font-weight:600;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 18px;font-size:12px;color:#93959f;font-weight:700;text-transform:uppercase;">Subject</td>
        <td style="padding:12px 18px;font-size:14px;color:#282c3f;font-weight:600;">${subject}</td>
      </tr>
    </table>

    <div style="background:#fff;border:1px solid #e9e9eb;border-radius:10px;padding:18px;margin-top:18px;">
      <div style="font-size:12px;color:#93959f;text-transform:uppercase;font-weight:700;margin-bottom:8px;">
        Message
      </div>
      <div style="font-size:14px;color:#282c3f;line-height:1.7;white-space:pre-wrap;">${message}</div>
    </div>
  `;

  return {
    subject: `📬 Contact: ${subject}`,
    html: baseTemplate({
      preheader: `New contact message from ${name}`,
      title: "New Contact Message",
      body,
      accentColor: "#8b5cf6",
    }),
  };
};

/* ---------- Auto-reply to sender ---------- */
export const contactUserEmail = ({ name, subject }) => {
  const body = `
    <h1 style="font-size:22px;font-weight:800;color:#282c3f;margin:0 0 8px;">
      Thanks for reaching out, ${name}!
    </h1>
    <p style="font-size:15px;color:#686b78;margin:0 0 22px;line-height:1.6;">
      We've received your message about <strong>"${subject}"</strong> and our team will get back to you within 24 hours.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #10b981;border-radius:6px;padding:14px 18px;">
      <p style="font-size:13px;color:#065f46;margin:0;line-height:1.6;">
        <strong>Tip:</strong> For faster help with an active order, keep your Order ID handy when you reply.
      </p>
    </div>

    <p style="font-size:14px;color:#686b78;margin:22px 0 0;line-height:1.6;">
      In the meantime, browse our latest restaurants for something delicious.
    </p>
  `;

  return {
    subject: "✅ We've received your message",
    html: baseTemplate({
      preheader: "Our team will reply within 24 hours.",
      title: "We Received Your Message",
      body,
      ctaText: "Browse Restaurants",
      ctaUrl: process.env.CLIENT_URL || "http://localhost:5173",
      accentColor: "#10b981",
    }),
  };
};
