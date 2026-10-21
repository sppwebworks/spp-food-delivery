import { StandardCheckoutClient, Env } from "@phonepe-pg/pg-sdk-node";

const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = Number(process.env.PHONEPE_CLIENT_VERSION) || 1;
const env =
  process.env.PHONEPE_ENV === "PRODUCTION" ? Env.PRODUCTION : Env.SANDBOX;

if (!clientId || !clientSecret) {
  console.warn("⚠️ PhonePe credentials missing — PhonePe payments will fail.");
}

let phonepeClientInstance = null;

if (clientId && clientSecret) {
  try {
    phonepeClientInstance = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env,
    );
  } catch (err) {
    console.error("❌ Failed to initialize PhonePe client:", err.message);
  }
}

export const phonepeClient = phonepeClientInstance;
