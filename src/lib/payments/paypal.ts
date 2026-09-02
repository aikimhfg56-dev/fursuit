import { isPaypalConfigured } from "@/lib/env";

const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export type CreatePaypalOrderInput = {
  amount: number;
  currency: "USD" | "GBP" | "EUR" | "AUD" | "JPY";
  referenceCode: string;
  returnUrl: string;
  cancelUrl: string;
};

/** Step 1 of PayPal's two-step flow: create an order, redirect the shopper to the approval link. */
export async function createPaypalOrder(input: CreatePaypalOrderInput) {
  if (!isPaypalConfigured()) {
    throw new Error("PayPal is not configured (PAYPAL_CLIENT_ID/SECRET missing)");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.referenceCode,
          amount: {
            currency_code: input.currency,
            value: input.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal order creation failed: ${response.status}`);
  }

  return response.json() as Promise<{ id: string; links: { rel: string; href: string }[] }>;
}

/** Step 2: capture payment once the shopper has approved the order on PayPal's site. */
export async function capturePaypalOrder(orderId: string) {
  if (!isPaypalConfigured()) {
    throw new Error("PayPal is not configured (PAYPAL_CLIENT_ID/SECRET missing)");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`PayPal order capture failed: ${response.status}`);
  }

  return response.json();
}
