/**
 * ============================================================
 * EMAIL SERVICE
 * ============================================================
 * Single entry point for sending every email.
 *
 * Key design decisions:
 *   1. Never throws — email failures should not break HTTP flows
 *   2. Logs every send attempt (success + failure)
 *   3. In dev mode, logs the HTML to console instead of sending
 *   4. Fire-and-forget by default — use `await` only when needed
 * ============================================================
 */

import { mailer, isEmailDevMode } from "../config/mailer.js";

const FROM = process.env.SMTP_FROM || "FoodieHub <noreply@foodiehub.com>";

/**
 * Send an email. Never throws.
 *
 * @param {Object} options
 * @param {string} options.to        - Recipient email
 * @param {string} options.subject   - Subject line
 * @param {string} options.html      - HTML body
 * @param {string} [options.text]    - Plain-text fallback (optional)
 * @param {string} [options.replyTo] - Reply-To address (optional)
 * @param {Array}  [options.attachments] - Attachments (optional)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}) => {
  if (!to || !subject || !html) {
    console.warn("[email] Missing required fields:", { to, subject });
    return { success: false, error: "Missing required fields" };
  }

  // Dev mode — log to console, don't actually send
  if (isEmailDevMode) {
    console.log("\n═══════════════════════════════════════════");
    console.log("📧 EMAIL (DEV MODE)");
    console.log("═══════════════════════════════════════════");
    console.log(`  To:      ${to}`);
    console.log(`  From:    ${FROM}`);
    console.log(`  Subject: ${subject}`);
    if (replyTo) console.log(`  Reply-To:${replyTo}`);
    console.log(`  HTML:    ${html.length} bytes`);
    console.log("═══════════════════════════════════════════\n");
    return { success: true, devMode: true };
  }

  // Production — actually send
  try {
    const info = await mailer.sendMail({
      from: FROM,
      to,
      subject,
      html,
      text: text || subject,
      replyTo,
      attachments,
    });

    console.log(`✉️  Email sent to ${to} — id: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email send failed to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Fire-and-forget variant.
 * Use this in HTTP handlers so the response isn't blocked.
 *
 * @example
 *   sendAsync({ to: user.email, ...welcomeEmail(user) });
 */
export const sendAsync = (options) => {
  sendEmail(options).catch((err) =>
    console.error("[email] async send failed:", err),
  );
};

export default { sendEmail, sendAsync };
