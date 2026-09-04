import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAccountProfile, hasShippingDetails } from "@/lib/account/profile";
import { isClerkConfigured } from "@/lib/env";
import { sendNotificationEmail, type NotificationEmailAttachment } from "@/lib/email/resend";
import {
  MAX_REFERENCE_FILES,
  MAX_REFERENCE_FILE_SIZE_BYTES,
  MAX_REFERENCE_TOTAL_SIZE_BYTES,
} from "@/lib/forms/referenceFiles";
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
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const designNotes = String(formData.get("designNotes") ?? "").trim();
  if (!designNotes) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const hasHorns = formData.get("hasHorns") === "on";
  const hasTail = formData.get("hasTail") === "on";

  const files = formData.getAll("referenceFiles").filter((value): value is File => value instanceof File && value.size > 0);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (
    files.length > MAX_REFERENCE_FILES ||
    files.some((file) => file.size > MAX_REFERENCE_FILE_SIZE_BYTES) ||
    totalSize > MAX_REFERENCE_TOTAL_SIZE_BYTES
  ) {
    return NextResponse.json({ error: "files_too_large" }, { status: 400 });
  }

  const attachments: NotificationEmailAttachment[] = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
    })),
  );

  const address = profile.address!;

  const text = [
    `Name: ${profile.fullName}`,
    `Email: ${email}`,
    `Address: ${[address.line1, address.line2, address.city, address.postalCode, address.country].filter(Boolean).join(", ")}`,
    `Horns: ${hasHorns ? "Yes" : "No"}`,
    `Tail: ${hasTail ? "Yes" : "No"}`,
    `Reference files attached: ${files.length}`,
    "",
    "Design notes:",
    designNotes,
  ].join("\n");

  await sendNotificationEmail({
    subject: `New commission quote request — ${profile.fullName}`,
    text,
    replyTo: email,
    attachments,
  });

  return NextResponse.json({ success: true });
}
