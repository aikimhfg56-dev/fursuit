import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile } from "@/lib/account/profile";
import { isClerkConfigured, isCoinbaseConfigured } from "@/lib/env";
import { verifyCoinbaseWebhookSignature } from "@/lib/payments/coinbase";
import { createOrder } from "@/lib/orders/createOrder";
import { createThread } from "@/lib/messages/store";
import { sendNotificationEmail } from "@/lib/email/resend";
import { decrementStock } from "@/lib/seller/store";

type CoinbaseChargeEvent = {
  event: {
    type: string;
    data: {
      id: string;
      metadata?: {
        referenceCode?: string;
        clerkUserId?: string;
        productKind?: string;
        productSlug?: string;
        productName?: string;
      };
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

    const productKind = charge.metadata?.productKind === "preorder" ? "preorder" : "shop";

    const order = await createOrder({
      buyerUserId: clerkUserId,
      productKind,
      paymentMethod: "coinbase",
      paymentStatus: "paid",
      referenceCode,
      providerReference: charge.id,
      amountTotal: Number(charge.pricing?.local?.amount ?? 0),
      currency: charge.pricing?.local?.currency ?? "usd",
      customerEmail,
      customerName,
      productName: charge.metadata?.productName,
      shippingAddress,
    });

    const productSlug = charge.metadata?.productSlug;
    if (productSlug) {
      await decrementStock(productKind, productSlug);
    }

    // Only preorder (semi-order) purchases get a post-purchase chat thread —
    // finished Shop goods have no color/size left to discuss.
    if (clerkUserId && productKind === "preorder") {
      await createThread({
        kind: "preorder",
        buyerUserId: clerkUserId,
        buyerName: customerName,
        buyerEmail: customerEmail,
        customerNumber: order.customerNumber,
        productName: charge.metadata?.productName ?? "",
        productSlug: charge.metadata?.productSlug,
        referenceCode,
      });
    }

    await sendNotificationEmail({
      subject: `New order — ${referenceCode}`,
      text: `Coinbase Commerce charge confirmed. Charge: ${charge.id}, amount: ${charge.pricing?.local?.amount}, currency: ${charge.pricing?.local?.currency}.`,
    });
  }

  return NextResponse.json({ received: true });
}
