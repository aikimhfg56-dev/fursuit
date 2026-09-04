import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile } from "@/lib/account/profile";
import { isClerkConfigured, isPaypalConfigured } from "@/lib/env";
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

  const user = isClerkConfigured() ? await currentUser() : null;
  const profile = user ? getAccountProfile(user) : {};

  try {
    const result = await processPaypalCapture(orderId, referenceCode, {
      customerEmail: user?.primaryEmailAddress?.emailAddress,
      customerName: profile.fullName,
      shippingAddress: profile.address,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("PayPal order capture failed", error);
    return NextResponse.json({ error: "paypal_capture_failed" }, { status: 502 });
  }
}
