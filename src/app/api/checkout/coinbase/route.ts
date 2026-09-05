import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import type { SupportedCurrency } from "@/lib/currency/constants";
import { convertFromUsd } from "@/lib/currency/rates";
import { isClerkConfigured, isCoinbaseConfigured } from "@/lib/env";
import { createCoinbaseCharge } from "@/lib/payments/coinbase";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("checkout-coinbase", 10, "1 m");

export async function POST(request: Request) {
  const { success: withinLimit } = await rateLimiter.limit(getClientIp(request));
  if (!withinLimit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isCoinbaseConfigured()) {
    return NextResponse.json(
      { error: "Coinbase Commerce is not configured yet. Add COINBASE_COMMERCE_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  // Purchases require a signed-in account with shipping details already on
  // file — mirrors the UI gate in ShippingGateSection, enforced again here
  // since the client can't be trusted to have honored it.
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = getAccountProfile(user);
  if (!hasShippingDetails(profile)) {
    return NextResponse.json({ error: "shipping_details_required" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const productName = typeof body?.productName === "string" ? body.productName : "";
  const amountUsd = Number(body?.amountUsd);
  const shippingUsd = Number(body?.shippingUsd) || 0;
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";
  const successUrl = typeof body?.successUrl === "string" ? body.successUrl : "";
  const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";

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
  const finalAmountInCurrency = await convertFromUsd(finalAmountUsd, currency as SupportedCurrency);

  const referenceCode = generateReferenceCode();

  try {
    const charge = await createCoinbaseCharge({
      name: productName,
      amount: finalAmountInCurrency,
      currency,
      referenceCode,
      redirectUrl: successUrl,
      cancelUrl,
      clerkUserId: user.id,
    });

    if (!charge) {
      return NextResponse.json({ error: "coinbase_charge_failed" }, { status: 502 });
    }

    return NextResponse.json({ url: charge.hosted_url, referenceCode });
  } catch (error) {
    console.error("Coinbase Commerce charge creation failed", error);
    return NextResponse.json({ error: "coinbase_charge_failed" }, { status: 502 });
  }
}
