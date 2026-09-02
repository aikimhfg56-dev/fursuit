import { NextResponse } from "next/server";
import { isPaypalConfigured } from "@/lib/env";
import { processPaypalCapture } from "@/lib/orders/paypalCapture";

export async function POST(request: Request) {
  if (!isPaypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const referenceCode = typeof body?.referenceCode === "string" ? body.referenceCode : undefined;

  if (!orderId) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const result = await processPaypalCapture(orderId, referenceCode);
    return NextResponse.json(result);
  } catch (error) {
    console.error("PayPal order capture failed", error);
    return NextResponse.json({ error: "paypal_capture_failed" }, { status: 502 });
  }
}
