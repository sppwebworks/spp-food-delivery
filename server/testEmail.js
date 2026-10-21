/**
 * ============================================================
 * EMAIL TEST SCRIPT
 * ============================================================
 * Usage:
 *   node testEmail.js recipient@example.com
 * ============================================================
 */

import "dotenv/config";
import nodemailer from "nodemailer";
import { welcomeEmail } from "./src/emails/templates/welcomeEmail.js";
import { orderConfirmationEmail } from "./src/emails/templates/orderConfirmationEmail.js";
import { orderStatusEmail } from "./src/emails/templates/orderStatusEmail.js";

const recipient = process.argv[2];

console.log("\n╔══════════════════════════════════════════╗");
console.log("║       EMAIL PIPELINE TEST                ║");
console.log("╚══════════════════════════════════════════╝\n");

if (!recipient) {
  console.error("❌ Usage: node testEmail.js your@email.com");
  process.exit(1);
}

/* ---------- STEP 1: Env ---------- */
console.log("📋 STEP 1: Environment variables");
const env = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? "***SET***" : "❌ MISSING",
  SMTP_FROM: process.env.SMTP_FROM,
  EMAIL_DEV_MODE: process.env.EMAIL_DEV_MODE,
};
console.log(JSON.stringify(env, null, 2));

if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.error("\n❌ Missing SMTP credentials in .env");
  process.exit(1);
}

if (process.env.EMAIL_DEV_MODE === "true") {
  console.log("\n⚠️  EMAIL_DEV_MODE=true — emails will be LOGGED, not SENT.");
  console.log("   To receive real emails, set EMAIL_DEV_MODE=false in .env\n");
}

/* ---------- STEP 2: Transport ---------- */
console.log("📋 STEP 2: Creating SMTP transport...");

let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Bypass TLS cert verification for dev environments with SSL inspection
    tls: {
      rejectUnauthorized: false,
    },
  });
  console.log("✅ Transport created");
} catch (err) {
  console.error("❌ Transport creation failed:", err.message);
  process.exit(1);
}

/* ---------- STEP 3: Verify ---------- */
console.log("\n📋 STEP 3: Verifying SMTP connection...");
try {
  await transporter.verify();
  console.log("✅ SMTP connection verified — credentials are valid");
} catch (err) {
  console.error("❌ SMTP verify failed:", err.message);
  console.error("\nCommon causes:");
  console.error(
    "  - Wrong app password (Gmail needs App Password, not account password)",
  );
  console.error("  - 2-Step Verification not enabled on the Google account");
  console.error("  - SMTP_HOST or SMTP_PORT wrong");
  console.error("  - Firewall blocking port 587 / 465");
  process.exit(1);
}

/* ---------- STEP 4: Send test emails ---------- */
console.log(`\n📋 STEP 4: Sending test emails to ${recipient}\n`);

const results = [];

/* ----- Test 1: Simple plain text ----- */
try {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: "✅ Test 1: SMTP Works",
    text: "If you're reading this, SMTP is working.",
    html: `
      <div style="font-family:sans-serif;padding:20px;">
        <h2>✅ SMTP Works</h2>
        <p>If you're reading this, your email pipeline is working.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      </div>
    `,
  });
  console.log(`✅ Test 1 sent — messageId: ${info.messageId}`);
  results.push({ test: "Simple SMTP", status: "PASS" });
} catch (err) {
  console.error(`❌ Test 1 failed: ${err.message}`);
  results.push({ test: "Simple SMTP", status: "FAIL", error: err.message });
}

/* ----- Test 2: Welcome template ----- */
try {
  const { subject, html } = welcomeEmail({
    name: "Test User",
    email: recipient,
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `[Template] ${subject}`,
    html,
  });
  console.log(`✅ Test 2 (welcome) sent — messageId: ${info.messageId}`);
  results.push({ test: "Welcome template", status: "PASS" });
} catch (err) {
  console.error(`❌ Test 2 failed: ${err.message}`);
  results.push({
    test: "Welcome template",
    status: "FAIL",
    error: err.message,
  });
}

/* ----- Test 3: Order confirmation ----- */
try {
  const mockOrder = {
    _id: "TEST" + Date.now(),
    items: [
      { name: "Chicken Biryani", price: 299, quantity: 2, image: "" },
      { name: "Coke", price: 49, quantity: 1, image: "" },
    ],
    subtotal: 647,
    deliveryFee: 30,
    tax: 32,
    discount: 0,
    total: 709,
    phone: "9876543210",
    address: {
      label: "Home",
      line1: "123 MG Road",
      line2: "Near Metro",
      city: "Bangalore",
      pincode: "560001",
    },
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const { subject, html } = orderConfirmationEmail({
    name: "Test User",
    order: mockOrder,
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `[Template] ${subject}`,
    html,
  });
  console.log(`✅ Test 3 (order confirm) sent — messageId: ${info.messageId}`);
  results.push({ test: "Order confirmation template", status: "PASS" });
} catch (err) {
  console.error(`❌ Test 3 failed: ${err.message}`);
  results.push({
    test: "Order confirmation template",
    status: "FAIL",
    error: err.message,
  });
}

/* ----- Test 4: Order status ----- */
try {
  const mockOrder = {
    _id: "TEST" + Date.now(),
    status: "out_for_delivery",
  };
  const { subject, html } = orderStatusEmail({
    name: "Test User",
    order: mockOrder,
    status: "out_for_delivery",
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipient,
    subject: `[Template] ${subject}`,
    html,
  });
  console.log(`✅ Test 4 (order status) sent — messageId: ${info.messageId}`);
  results.push({ test: "Order status template", status: "PASS" });
} catch (err) {
  console.error(`❌ Test 4 failed: ${err.message}`);
  results.push({
    test: "Order status template",
    status: "FAIL",
    error: err.message,
  });
}

/* ---------- Summary ---------- */
console.log("\n╔══════════════════════════════════════════╗");
console.log("║       TEST RESULTS                       ║");
console.log("╚══════════════════════════════════════════╝\n");
results.forEach((r) => {
  const icon = r.status === "PASS" ? "✅" : "❌";
  console.log(`${icon} ${r.test.padEnd(30)} ${r.status}`);
  if (r.error) console.log(`   └─ ${r.error}`);
});

const passed = results.filter((r) => r.status === "PASS").length;
console.log(`\n${passed}/${results.length} tests passed\n`);

console.log(`📬 Check inbox at: ${recipient}`);
console.log(`   Don't forget to check the SPAM folder!`);
console.log(`   Emails may take 5–30 seconds to arrive.\n`);

process.exit(passed === results.length ? 0 : 1);
