import { NextResponse } from "next/server";
import { isStripeConfigured } from "@/lib/env";
import { createStripeCheckoutSession, type StripePaymentMethod } from "@/lib/payments/stripe";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";

const STRIPE_METHODS: StripePaymentMethod[] = ["card", "alipay", "revolut_pay"];

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const productName = typeof body?.productName === "string" ? body.productName : "";
  const amountUsd = Number(body?.amountUsd);
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

  let finalAmountUsd = amountUsd;
  if (promoCode) {
    const promoResult = await validatePromoCode(promoCode, amountUsd);
    if (promoResult.valid) {
      finalAmountUsd = promoResult.amountAfterDiscount;
    }
  }

  const referenceCode = generateReferenceCode();

  try {
    const session = await createStripeCheckoutSession({
      productName,
      unitAmount: finalAmountUsd,
      currency: currency as "usd" | "gbp" | "eur" | "aud" | "jpy",
      paymentMethods: paymentMethodsRequested.length > 0 ? paymentMethodsRequested : ["card"],
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
