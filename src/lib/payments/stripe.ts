import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/env";

let cachedClient: Stripe | null = null;

/** Returns null until STRIPE_SECRET_KEY is set. */
export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured()) return null;

  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  return cachedClient;
}

export type StripePaymentMethod = "card" | "alipay";

export type CreateStripeCheckoutSessionInput = {
  productName: string;
  /** Already promo-discounted, in the shopper's selected display currency. */
  unitAmount: number;
  currency: "usd" | "gbp" | "eur" | "aud" | "jpy";
  paymentMethods: StripePaymentMethod[];
  referenceCode: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  /** Stashed in session metadata so the webhook can look the shopper's shipping details back up. */
  clerkUserId: string;
  /** Stashed in metadata so the webhook can open a post-purchase chat thread for preorder purchases. */
  productKind: "shop" | "preorder";
  productSlug: string;
};

/**
 * Card and Alipay are both natively supported `payment_method_types` in
 * Stripe Checkout — no separate SDK/integration needed beyond listing them here.
 */
export async function createStripeCheckoutSession(input: CreateStripeCheckoutSessionInput) {
  const stripe = getStripeClient();
  if (!stripe) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }

  // Zero-decimal currencies (like JPY) use whole units; the others use minor units (cents).
  const zeroDecimalCurrencies = new Set(["jpy"]);
  const unitAmountForStripe = zeroDecimalCurrencies.has(input.currency)
    ? Math.round(input.unitAmount)
    : Math.round(input.unitAmount * 100);

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: input.paymentMethods,
    customer_email: input.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: input.currency,
          unit_amount: unitAmountForStripe,
          product_data: { name: input.productName },
        },
      },
    ],
    metadata: {
      referenceCode: input.referenceCode,
      clerkUserId: input.clerkUserId,
      productKind: input.productKind,
      productSlug: input.productSlug,
      productName: input.productName,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
}

/** Used by the checkout success page to confirm payment and read back the reference code. */
export async function retrieveStripeCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("Failed to retrieve Stripe checkout session", error);
    return null;
  }
}
