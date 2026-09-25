import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import { assignCustomerNumber } from "@/lib/customerNumber";
import { isClerkConfigured } from "@/lib/env";
import { sendNotificationEmail } from "@/lib/email/resend";
import { addMessage, createThread } from "@/lib/messages/store";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("forms-preorder", 5, "10 m");

/**
 * Semi Order has no direct checkout — the design is fixed but color, size,
 * and (optionally) an installment plan need the seller's confirmation
 * first, so this opens a chat thread instead of taking payment, same as
 * Custom Commission quotes.
 */
export async function POST(request: Request) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  // Requires an account with shipping details already on file, same gate as
  // Shop/Semi Order checkout and Custom Commission quotes — identity/address
  // come from Clerk, never the client-submitted body.
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profile = getAccountProfile(user);
  if (!hasShippingDetails(profile)) {
    return NextResponse.json({ error: "shipping_details_required" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const productName = typeof body?.productName === "string" ? body.productName : "";
  const productSlug = typeof body?.productSlug === "string" ? body.productSlug : "";
  const colorPreference = typeof body?.colorPreference === "string" ? body.colorPreference.trim() : "";
  const sizePreference = typeof body?.sizePreference === "string" ? body.sizePreference.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const installmentPayment = body?.installmentPayment === true;

  if (!productName || !productSlug || !colorPreference || !sizePreference || body?.agreedToTerms !== true) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const address = profile.address!;

  // Shares the "order" customer-number sequence with Custom Commission quotes.
  const customerNumber = await assignCustomerNumber("order");

  const thread = await createThread({
    kind: "preorder",
    buyerUserId: user.id,
    buyerName: profile.fullName,
    buyerEmail: email,
    customerNumber,
    productName,
    productSlug,
  });

  const messageText = [
    `Preferred color: ${colorPreference}`,
    `Preferred size: ${sizePreference}`,
    `Installment payment requested: ${installmentPayment ? "Yes" : "No"}`,
    ...(notes ? ["", notes] : []),
  ].join("\n");

  await addMessage(thread.id, { sender: "buyer", text: messageText });

  await sendNotificationEmail({
    subject: `New Semi Order request — ${productName} (${profile.fullName})`,
    text: [
      `Name: ${profile.fullName}`,
      `Email: ${email}`,
      `Address: ${[address.line1, address.line2, address.city, address.postalCode, address.country].filter(Boolean).join(", ")}`,
      `Product: ${productName}`,
      "",
      messageText,
    ].join("\n"),
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
