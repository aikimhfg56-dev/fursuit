import Stripe from "stripe";
import type { SupportedCurrency } from "@/lib/currency/constants";
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

export type StripePaymentMethod = "card" | "alipay" | "revolut_pay";

/**
 * Stripe rejects a Checkout Session outright if `payment_method_types`
 * includes a method that isn't valid for the line items' currency — Revolut
 * Pay is presentment-currency-restricted to GBP/EUR (card and Alipay are
 * fine across our full USD/GBP/EUR/AUD/JPY currency set). Used both to
 * decide which methods to show in the UI and to sanitize what the API route
 * actually sends Stripe, so a client requesting an ineligible combination
 * can't produce a failed session instead of degrading to "card".
 */
const REVOLUT_PAY_CURRENCIES = new Set<SupportedCurrency>(["GBP", "EUR"]);

export function isRevolutPayEligible(currency: SupportedCurrency): boolean {
  return REVOLUT_PAY_CURRENCIES.has(currency);
}

export function filterEligibleStripeMethods(
  requested: StripePaymentMethod[],
  currency: SupportedCurrency,
): StripePaymentMethod[] {
  const eligible = requested.filter((method) => (method === "revolut_pay" ? isRevolutPayEligible(currency) : true));
  return eligible.length > 0 ? eligible : ["card"];
}

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
};

/**
 * Card, Alipay, and Revolut Pay are all natively supported
 * `payment_method_types` in Stripe Checkout — no separate SDK/integration
 * needed for those two beyond listing them here.
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
    metadata: { referenceCode: input.referenceCode, clerkUserId: input.clerkUserId },
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
