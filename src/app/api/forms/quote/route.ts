import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import { isClerkConfigured } from "@/lib/env";
import { sendNotificationEmail } from "@/lib/email/resend";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("forms-quote", 3, "10 m");

export async function POST(request: Request) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  // Commission quotes require an account with shipping details already on
  // file (see lib/account/shippingGate.ts) — identity/address come from
  // Clerk, never from the client-submitted body, so this can't be spoofed.
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = getAccountProfile(user);
  if (!hasShippingDetails(profile)) {
    return NextResponse.json({ error: "shipping_details_required" }, { status: 400 });
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const body = await request.json().catch(() => null);
  const characterDescription =
    typeof body?.characterDescription === "string" ? body.characterDescription.trim() : "";

  if (!characterDescription) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const budget = typeof body?.budget === "string" ? body.budget.trim() : "";
  const timeline = typeof body?.timeline === "string" ? body.timeline.trim() : "";
  const referenceLinks = typeof body?.referenceLinks === "string" ? body.referenceLinks.trim() : "";
  const address = profile.address!;

  const text = [
    `Name: ${profile.fullName}`,
    `Email: ${email}`,
    `Address: ${[address.line1, address.line2, address.city, address.postalCode, address.country].filter(Boolean).join(", ")}`,
    `Budget: ${budget || "-"}`,
    `Timeline: ${timeline || "-"}`,
    `Reference links: ${referenceLinks || "-"}`,
    "",
    "Character description:",
    characterDescription,
  ].join("\n");

  await sendNotificationEmail({
    subject: `New commission quote request — ${profile.fullName}`,
    text,
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
