import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { isClerkConfigured, isStripeConfigured } from "@/lib/env";
import { getAccountProfile } from "@/lib/account/profile";
import { getStripeClient } from "@/lib/payments/stripe";

/**
 * Sends the shopper to Stripe's hosted Billing Portal to add/remove saved
 * payment methods — we never handle raw card data ourselves. Creates a
 * Stripe Customer (linked via privateMetadata.stripeCustomerId) on first use.
 */
export async function POST(request: Request) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";
  if (!returnUrl) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const stripe = getStripeClient()!;
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = getAccountProfile(user);
  let stripeCustomerId = profile.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: profile.fullName,
      email: user.primaryEmailAddress?.emailAddress,
      address: profile.address
        ? {
            line1: profile.address.line1,
            line2: profile.address.line2,
            city: profile.address.city,
            postal_code: profile.address.postalCode,
            country: profile.address.country,
          }
        : undefined,
      metadata: { clerkUserId: userId },
    });

    stripeCustomerId = customer.id;

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { ...user.privateMetadata, stripeCustomerId },
    });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return NextResponse.json({ url: portalSession.url });
}
