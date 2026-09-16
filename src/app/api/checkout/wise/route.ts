import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import type { SupportedCurrency } from "@/lib/currency/constants";
import { convertFromUsd } from "@/lib/currency/rates";
import { isClerkConfigured, isWiseConfigured } from "@/lib/env";
import { getWiseBankDetails } from "@/lib/payments/wise";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { createOrder } from "@/lib/orders/createOrder";
import { createThread } from "@/lib/messages/store";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { sendNotificationEmail } from "@/lib/email/resend";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";
import { decrementStock, isProductSoldOut } from "@/lib/seller/store";

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

  // Mirrors the UI gate on the terms-agreement checkbox — enforced again
  // here since the client can't be trusted to have honored it.
  if (body?.agreedToTerms !== true) {
    return NextResponse.json({ error: "terms_not_agreed" }, { status: 400 });
  }

  const productName = typeof body?.productName === "string" ? body.productName : "";
  const productKind = body?.productKind === "preorder" ? "preorder" : "shop";
  const productSlug = typeof body?.productSlug === "string" ? body.productSlug : "";
  const amountUsd = Number(body?.amountUsd);
  const shippingUsd = Number(body?.shippingUsd) || 0;
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // The storefront hides the "Pay" button for sold-out items — re-checked
  // here since the client can't be trusted to have honored it.
  if (productSlug && (await isProductSoldOut(productKind, productSlug))) {
    return NextResponse.json({ error: "sold_out" }, { status: 409 });
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

  const order = await createOrder({
    buyerUserId: user.id,
    productKind,
    paymentMethod: "wise",
    paymentStatus: "awaiting_bank_transfer",
    referenceCode,
    amountTotal: finalAmountInCurrency,
    currency,
    customerEmail: user.primaryEmailAddress?.emailAddress,
    customerName: profile.fullName,
    productName,
    shippingAddress: profile.address,
  });

  if (productSlug) {
    await decrementStock(productKind, productSlug);
  }

  // Every completed purchase gets a post-purchase chat thread with the seller.
  await createThread({
    kind: productKind,
    buyerUserId: user.id,
    buyerName: profile.fullName,
    buyerEmail: user.primaryEmailAddress?.emailAddress,
    customerNumber: order.customerNumber,
    productName,
    productSlug,
    referenceCode,
  });

  await sendNotificationEmail({
    subject: `Wise bank transfer expected — ${referenceCode}`,
    text: `A shopper chose bank transfer via Wise for ${finalAmountInCurrency.toFixed(2)} ${currency}. Watch for a transfer referencing ${referenceCode} and mark the order paid once received.`,
  });

  return NextResponse.json({ referenceCode, bankDetails: getWiseBankDetails() });
}
