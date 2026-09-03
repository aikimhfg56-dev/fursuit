import { NextResponse } from "next/server";
import type { SupportedCurrency } from "@/lib/currency/constants";
import { convertFromUsd } from "@/lib/currency/rates";
import { isStripeConfigured } from "@/lib/env";
import {
  createStripeCheckoutSession,
  filterEligibleStripeMethods,
  type StripePaymentMethod,
} from "@/lib/payments/stripe";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const STRIPE_METHODS: StripePaymentMethod[] = ["card", "alipay", "revolut_pay"];
// Also guards against card-testing abuse (many rapid checkout attempts from one IP).
const rateLimiter = getRateLimiter("checkout-stripe", 10, "1 m");

export async function POST(request: Request) {
  const { success: withinLimit } = await rateLimiter.limit(getClientIp(request));
  if (!withinLimit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const productName = typeof body?.productName === "string" ? body.productName : "";
  const amountUsd = Number(body?.amountUsd);
  const shippingUsd = Number(body?.shippingUsd) || 0;
  const currency = typeof body?.currency === "string" ? body.currency.toLowerCase() : "usd";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";
  const successUrl = typeof body?.successUrl === "string" ? body.successUrl : "";
  const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";
  const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail : undefined;

  const paymentMethodsRequested: StripePaymentMethod[] = Array.isArray(body?.paymentMethods)
    ? body.paymentMethods.filter((method: unknown): method is StripePaymentMethod =>
        STRIPE_METHODS.includes(method as StripePaymentMethod),
      )
    : ["card"];

  if (!productName || !Number.isFinite(amountUsd) || amountUsd <= 0 || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  let discountedSubtotalUsd = amountUsd;
  if (promoCode) {
    const promoResult = await validatePromoCode(promoCode, amountUsd);
    if (promoResult.valid) {
      discountedSubtotalUsd = promoResult.amountAfterDiscount;
    }
  }

  const finalAmountUsd = discountedSubtotalUsd + shippingUsd;
  const finalAmountInCurrency = await convertFromUsd(finalAmountUsd, currency.toUpperCase() as SupportedCurrency);

  const referenceCode = generateReferenceCode();
  const eligibleMethods = filterEligibleStripeMethods(
    paymentMethodsRequested.length > 0 ? paymentMethodsRequested : ["card"],
    currency.toUpperCase() as SupportedCurrency,
  );

  try {
    const session = await createStripeCheckoutSession({
      productName,
      unitAmount: finalAmountInCurrency,
      currency: currency as "usd" | "gbp" | "eur" | "aud" | "jpy",
      paymentMethods: eligibleMethods,
      referenceCode,
      successUrl,
      cancelUrl,
      customerEmail,
    });

    return NextResponse.json({ url: session.url, referenceCode });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);
    return NextResponse.json({ error: "stripe_session_failed" }, { status: 502 });
  }
}
