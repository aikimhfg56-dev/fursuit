import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile } from "@/lib/account/profile";
import { isClerkConfigured, isCoinbaseConfigured } from "@/lib/env";
import { verifyCoinbaseWebhookSignature } from "@/lib/payments/coinbase";
import { createOrder } from "@/lib/orders/createOrder";
import { sendNotificationEmail } from "@/lib/email/resend";

type CoinbaseChargeEvent = {
  event: {
    type: string;
    data: {
      id: string;
      metadata?: { referenceCode?: string; clerkUserId?: string };
      pricing?: { local?: { amount?: string; currency?: string } };
    };
  };
};

export async function POST(request: Request) {
  if (!isCoinbaseConfigured()) {
    return NextResponse.json({ error: "coinbase_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-cc-webhook-signature");
  const payload = await request.text();

  if (!signature || !verifyCoinbaseWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const { event } = JSON.parse(payload) as CoinbaseChargeEvent;

  if (event.type === "charge:confirmed") {
    const charge = event.data;
    const referenceCode = charge.metadata?.referenceCode ?? charge.id;

    let customerEmail: string | undefined;
    let customerName: string | undefined;
    let shippingAddress: ReturnType<typeof getAccountProfile>["address"];
    const clerkUserId = charge.metadata?.clerkUserId;
    if (clerkUserId && isClerkConfigured()) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId).catch(() => null);
      if (user) {
        const profile = getAccountProfile(user);
        customerEmail = user.primaryEmailAddress?.emailAddress;
        customerName = profile.fullName;
        shippingAddress = profile.address;
      }
    }

    await createOrder({
      paymentMethod: "coinbase",
      paymentStatus: "paid",
      referenceCode,
      providerReference: charge.id,
      amountTotal: Number(charge.pricing?.local?.amount ?? 0),
      currency: charge.pricing?.local?.currency ?? "usd",
      customerEmail,
      customerName,
      shippingAddress,
    });

    await sendNotificationEmail({
      subject: `New order — ${referenceCode}`,
      text: `Coinbase Commerce charge confirmed. Charge: ${charge.id}, amount: ${charge.pricing?.local?.amount}, currency: ${charge.pricing?.local?.currency}.`,
    });
  }

  return NextResponse.json({ received: true });
}
