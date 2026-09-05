import { createHmac, timingSafeEqual } from "node:crypto";
import { isCoinbaseConfigured } from "@/lib/env";

const COINBASE_API_BASE = "https://api.commerce.coinbase.com";

type CreateChargeInput = {
  name: string;
  amount: number;
  currency: string;
  referenceCode: string;
  redirectUrl: string;
  cancelUrl: string;
  clerkUserId: string;
};

export type CoinbaseCharge = {
  id: string;
  code: string;
  hosted_url: string;
};

/**
 * Coinbase Commerce hosts its own checkout page (like Stripe Checkout) —
 * the shopper pays in whichever crypto they choose, and Coinbase converts
 * against the fixed fiat `local_price` given here. Order creation happens
 * in the webhook once the charge is confirmed, not here.
 */
export async function createCoinbaseCharge(input: CreateChargeInput): Promise<CoinbaseCharge | null> {
  if (!isCoinbaseConfigured()) return null;

  const response = await fetch(`${COINBASE_API_BASE}/charges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY!,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: input.name,
      pricing_type: "fixed_price",
      local_price: { amount: input.amount.toFixed(2), currency: input.currency.toUpperCase() },
      redirect_url: input.redirectUrl,
      cancel_url: input.cancelUrl,
      metadata: { referenceCode: input.referenceCode, clerkUserId: input.clerkUserId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Coinbase Commerce charge creation failed: ${response.status}`);
  }

  const { data } = await response.json();
  return data as CoinbaseCharge;
}

/** Verifies the `X-CC-Webhook-Signature` header against the raw request body. */
export function verifyCoinbaseWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}
