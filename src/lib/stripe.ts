import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key.includes("placeholder")) {
      return null;
    }
    stripe = new Stripe(key, { apiVersion: "2023-10-16" });
  }
  return stripe;
}

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && !key.includes("placeholder"));
}
