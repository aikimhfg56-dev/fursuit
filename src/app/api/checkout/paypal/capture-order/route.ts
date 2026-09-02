import { NextResponse } from "next/server";
import { isPaypalConfigured } from "@/lib/env";
import { capturePaypalOrder } from "@/lib/payments/paypal";
import { createOrder } from "@/lib/orders/createOrder";
import { sendNotificationEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const referenceCode = typeof body?.referenceCode === "string" ? body.referenceCode : orderId;

  if (!orderId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const capture = (await capturePaypalOrder(orderId)) as {
      status: string;
      payer?: { email_address?: string };
      purchase_units?: { payments?: { captures?: { amount?: { value?: string; currency_code?: string } }[] } }[];
    };

    const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];

    await createOrder({
      paymentMethod: "paypal",
      paymentStatus: capture.status === "COMPLETED" ? "paid" : "failed",
      referenceCode,
      providerReference: orderId,
      amountTotal: Number(captureDetails?.amount?.value ?? 0),
      currency: captureDetails?.amount?.currency_code ?? "USD",
      customerEmail: capture.payer?.email_address,
    });

    await sendNotificationEmail({
      subject: `New order — ${referenceCode}`,
      text: `PayPal order captured. Order: ${orderId}, status: ${capture.status}.`,
    });

    return NextResponse.json({ status: capture.status });
  } catch (error) {
    console.error("PayPal order capture failed", error);
    return NextResponse.json({ error: "paypal_capture_failed" }, { status: 502 });
  }
}
