/**
 * ============================================================
 * MAILER — Nodemailer transport + sendEmail + verify
 * ============================================================
 */

import nodemailer from "nodemailer";

const isDevMode = process.env.EMAIL_DEV_MODE === "true";

let transporter = null;

/* ---------- Create the transporter once ---------- */
if (!isDevMode) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Fire-and-forget verification — never crashes the app
  transporter
    .verify()
    .then(() => console.log("✅ SMTP transport ready"))
    .catch((err) => console.warn("⚠️  SMTP verify failed:", err.message));
} else {
  console.log("📭 EMAIL_DEV_MODE=true — emails will be logged to console");
}

/* ============================================================
   PUBLIC API — sendEmail
   ============================================================ */
export const sendEmail = async ({ to, subject, html, text = "" }) => {
  const from = process.env.EMAIL_FROM || "FoodieApp <noreply@foodieapp.local>";

  /* ---------- DEV MODE — log and return ---------- */
  if (isDevMode) {
    console.log("\n📧 [DEV EMAIL] ─────────────────────────────");
    console.log("   From:    ", from);
    console.log("   To:      ", to);
    console.log("   Subject: ", subject);
    console.log("   Text:    ", text || "(html only)");
    if (html) console.log("   HTML:    ", html.slice(0, 120) + "…");
    console.log("──────────────────────────────────────────\n");
    return { sent: false, mode: "dev", to, subject };
  }

  /* ---------- PROD MODE — real send ---------- */
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });
    console.log(`✉️  Email sent to ${to} — id: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
};

/* ============================================================
   PUBLIC API — verifyEmailConfig
   ============================================================ */
export const verifyEmailConfig = async () => {
  if (isDevMode) {
    console.log("📭 EMAIL_DEV_MODE=true — emails will be logged to console");
    return true;
  }

  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
    return true;
  } catch (err) {
    console.error("❌ SMTP verification failed:", err.message);
    if (/self-signed|certificate/i.test(err.message)) {
      console.error(
        "   → Likely a corporate/AV SSL-inspection proxy.\n" +
          "   → TLS bypass is already enabled in this transport.",
      );
    } else if (/Invalid login|535/i.test(err.message)) {
      console.error(
        "   → Check SMTP_USER / SMTP_PASS.\n" +
          "   → Gmail requires an App Password (not account password).",
      );
    }
    return false;
  }
};

/* ---------- Backwards-compat named exports ---------- */
export const mailer = transporter;
export const isEmailDevMode = isDevMode;
export default transporter;
