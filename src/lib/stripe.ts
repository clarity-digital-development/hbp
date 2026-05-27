import Stripe from "stripe";

// Lazily instantiate so the app still runs (and other pages render) before the
// Stripe keys are added to .env.local. The client is only created when a
// payment route actually needs it.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local (use a restricted key, rk_…)."
      );
    }
    cached = new Stripe(key, {
      // Pin to the latest API version (matches the SDK's bundled version).
      apiVersion: "2026-04-22.dahlia",
      appInfo: { name: "Hailey Brooke Photography" },
    });
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
