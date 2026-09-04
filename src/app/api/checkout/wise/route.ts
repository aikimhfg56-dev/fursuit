import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import type { SupportedCurrency } from "@/lib/currency/constants";
import { convertFromUsd } from "@/lib/currency/rates";
import { isClerkConfigured, isWiseConfigured } from "@/lib/env";
import { getWiseBankDetails } from "@/lib/payments/wise";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { createOrder } from "@/lib/orders/createOrder";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { sendNotificationEmail } from "@/lib/email/resend";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("checkout-wise", 10, "1 m");

export async function POST(request: Request) {
  const { success: withinLimit } = await rateLimiter.limit(getClientIp(request));
  if (!withinLimit) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isWiseConfigured()) {
    return NextResponse.json(
      { error: "Wise bank details are not configured yet. Add WISE_* vars to .env.local." },
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
  const amountUsd = Number(body?.amountUsd);
  const shippingUsd = Number(body?.shippingUsd) || 0;
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
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

  await createOrder({
    paymentMethod: "wise",
    paymentStatus: "awaiting_bank_transfer",
    referenceCode,
    amountTotal: finalAmountInCurrency,
    currency,
    customerEmail: user.primaryEmailAddress?.emailAddress,
    customerName: profile.fullName,
    shippingAddress: profile.address,
  });

  await sendNotificationEmail({
    subject: `Wise bank transfer expected — ${referenceCode}`,
    text: `A shopper chose bank transfer via Wise for ${finalAmountInCurrency.toFixed(2)} ${currency}. Watch for a transfer referencing ${referenceCode} and mark the order paid once received.`,
  });

  return NextResponse.json({ referenceCode, bankDetails: getWiseBankDetails() });
}
