import { NextResponse } from "next/server";
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
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";
  const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";
  const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";

  if (!Number.isFinite(amountUsd) || amountUsd <= 0 || !returnUrl || !cancelUrl) {
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
    const order = await createPaypalOrder({
      amount: finalAmountUsd,
      currency: currency as "USD" | "GBP" | "EUR" | "AUD" | "JPY",
      referenceCode,
      returnUrl,
      cancelUrl,
    });

    const approveLink = order.links.find((link) => link.rel === "approve")?.href;
    return NextResponse.json({ orderId: order.id, approveUrl: approveLink, referenceCode });
  } catch (error) {
    console.error("PayPal order creation failed", error);
    return NextResponse.json({ error: "paypal_order_failed" }, { status: 502 });
  }
}
