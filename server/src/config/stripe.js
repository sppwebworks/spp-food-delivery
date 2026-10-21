import Stripe from "stripe";

// ✅ Initialize once, reuse everywhere
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20", // Pin the API version
});
