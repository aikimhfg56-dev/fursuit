import { NextResponse } from "next/server";
import { isWiseConfigured } from "@/lib/env";
import { getWiseBankDetails } from "@/lib/payments/wise";
import { generateReferenceCode } from "@/lib/orders/referenceCode";
import { createOrder } from "@/lib/orders/createOrder";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { sendNotificationEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  if (!isWiseConfigured()) {
    return NextResponse.json(
      { error: "Wise bank details are not configured yet. Add WISE_* vars to .env.local." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const amountUsd = Number(body?.amountUsd);
  const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "USD";
  const promoCode = typeof body?.promoCode === "string" ? body.promoCode.trim() : "";
  const customerEmail = typeof body?.customerEmail === "string" ? body.customerEmail : undefined;

  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
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

  await createOrder({
    paymentMethod: "wise",
    paymentStatus: "awaiting_bank_transfer",
    referenceCode,
    amountTotal: finalAmountUsd,
    currency,
    customerEmail,
  });

  await sendNotificationEmail({
    subject: `Wise bank transfer expected — ${referenceCode}`,
    text: `A shopper chose bank transfer via Wise for ${finalAmountUsd} ${currency}. Watch for a transfer referencing ${referenceCode} and mark the order paid once received.`,
  });

  return NextResponse.json({ referenceCode, bankDetails: getWiseBankDetails() });
}
