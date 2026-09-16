import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAccountProfile } from "@/lib/account/profile";
import { isClerkConfigured, isStripeConfigured } from "@/lib/env";
import { getStripeClient } from "@/lib/payments/stripe";
import { createOrder } from "@/lib/orders/createOrder";
import { createThread } from "@/lib/messages/store";
import { sendNotificationEmail } from "@/lib/email/resend";
import { decrementStock } from "@/lib/seller/store";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const stripe = getStripeClient()!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentMethodType = session.payment_method_types?.[0] ?? "card";
    const paymentMethod =
      paymentMethodType === "alipay"
        ? "stripe_alipay"
        : paymentMethodType === "revolut_pay"
          ? "stripe_revolut_pay"
          : "stripe_card";

    // Shipping details live on the shopper's Clerk profile, not the Stripe
    // session — look them up via the clerkUserId stashed in metadata.
    let customerName: string | undefined;
    let shippingAddress: ReturnType<typeof getAccountProfile>["address"];
    const clerkUserId = session.metadata?.clerkUserId;
    if (clerkUserId && isClerkConfigured()) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId).catch(() => null);
      if (user) {
        const profile = getAccountProfile(user);
        customerName = profile.fullName;
        shippingAddress = profile.address;
      }
    }

    const customerEmail = session.customer_details?.email ?? undefined;
    const productKind = session.metadata?.productKind === "preorder" ? "preorder" : "shop";
    // Redirect-based methods (Alipay, Revolut Pay) can in principle complete
    // checkout without the payment itself succeeding — don't assume "paid"
    // just because the session finished.
    const paymentStatus = session.payment_status === "paid" ? "paid" : "failed";

    const order = await createOrder({
      buyerUserId: clerkUserId,
      productKind: paymentStatus === "paid" ? productKind : undefined,
      paymentMethod,
      paymentStatus,
      referenceCode: session.metadata?.referenceCode ?? session.id,
      providerReference: session.id,
      amountTotal: (session.amount_total ?? 0) / (session.currency === "jpy" ? 1 : 100),
      currency: session.currency ?? "usd",
      customerEmail,
      customerName,
      productName: session.metadata?.productName,
      shippingAddress,
    });

    const productSlug = session.metadata?.productSlug;
    if (paymentStatus === "paid" && productSlug) {
      await decrementStock(productKind, productSlug);
    }

    // Only preorder (semi-order) purchases get a post-purchase chat thread —
    // finished Shop goods have no color/size left to discuss.
    if (paymentStatus === "paid" && clerkUserId && productKind === "preorder") {
      await createThread({
        kind: "preorder",
        buyerUserId: clerkUserId,
        buyerName: customerName,
        buyerEmail: customerEmail,
        customerNumber: order.customerNumber,
        productName: session.metadata?.productName ?? "",
        productSlug: session.metadata?.productSlug,
        referenceCode: session.metadata?.referenceCode ?? session.id,
      });
    }

    await sendNotificationEmail({
      subject: `${paymentStatus === "paid" ? "New order" : "Payment failed"} — ${session.metadata?.referenceCode ?? session.id}`,
      text: `Stripe checkout session ${session.id} completed with payment_status="${session.payment_status}". Amount: ${session.amount_total}, currency: ${session.currency}.`,
    });
  }

  return NextResponse.json({ received: true });
}
