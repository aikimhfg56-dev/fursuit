import { NextResponse } from "next/server";
import type { SupportedCurrency } from "@/lib/currency/constants";
import { convertFromUsd } from "@/lib/currency/rates";
import { isPaypalConfigured } from "@/lib/env";
import { createPaypalOrder } from "@/lib/payments/paypal";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";

export async function POST(request: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured yet. Add PAYPAL_CLIENT_ID/SECRET to .env.local." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const amountUsd = Number(body?.amountUsd);
  const shippingUsd = Number(body?.shippingUsd) || 0;
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";
  const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";
  const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";

  if (!Number.isFinite(amountUsd) || amountUsd <= 0 || !returnUrl || !cancelUrl) {
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
  const finalAmountInCurrency = await convertFromUsd(finalAmountUsd, currency as SupportedCurrency);

  const referenceCode = generateReferenceCode();
  // PayPal appends its own token/PayerID params when redirecting back — ours
  // rides along so the success page can show a human-readable reference.
  const returnUrlWithReference = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}reference=${encodeURIComponent(referenceCode)}`;

  try {
    const order = await createPaypalOrder({
      amount: finalAmountInCurrency,
      currency: currency as "USD" | "GBP" | "EUR" | "AUD" | "JPY",
      referenceCode,
      returnUrl: returnUrlWithReference,
      cancelUrl,
    });

    const approveLink = order.links.find((link) => link.rel === "approve")?.href;
    return NextResponse.json({ orderId: order.id, approveUrl: approveLink, referenceCode });
  } catch (error) {
    console.error("PayPal order creation failed", error);
    return NextResponse.json({ error: "paypal_order_failed" }, { status: 502 });
  }
}
