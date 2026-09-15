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
import { addMessage, createThread } from "@/lib/messages/store";
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

  // Mirrors the UI gate on the terms-agreement checkbox — enforced again
  // here since the client can't be trusted to have honored it.
  if (formData.get("agreedToTerms") !== "on") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const VALID_ORDER_TYPES = ["fullSuit", "partialSuit", "parts"];
  const orderTypeRaw = String(formData.get("orderType") ?? "");
  const orderType = VALID_ORDER_TYPES.includes(orderTypeRaw) ? orderTypeRaw : "fullSuit";

  const VALID_PART_TYPES = [
    "head",
    "handpaws",
    "puffyHandpaws",
    "feetpawsOutdoorPlantigrade",
    "feetpawsOutdoorDigitigrade",
    "sockpawsIndoorPlantigrade",
    "tail",
    "armsleeves",
    "body",
  ];
  const partTypes = formData.getAll("partTypes").filter((value): value is string => typeof value === "string" && VALID_PART_TYPES.includes(value));
  const species = String(formData.get("species") ?? "").trim();

  if (orderType === "parts" && partTypes.length === 0) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const rushOrder = formData.get("rushOrder") === "on";
  const twitterId = String(formData.get("twitterId") ?? "").trim();
  const instagramId = String(formData.get("instagramId") ?? "").trim();

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
    `Order type: ${orderType}`,
    `Rush order (+10% of total): ${rushOrder ? "Yes" : "No"}`,
    ...(orderType === "parts" ? [`Part(s): ${partTypes.join(", ")}`, `Species: ${species || "-"}`] : []),
    `Twitter: ${twitterId || "-"}`,
    `Instagram: ${instagramId || "-"}`,
    `Reference files attached: ${files.length}`,
    "",
    "Design notes:",
    designNotes,
  ].join("\n");

  const ORDER_TYPE_LABELS: Record<string, string> = {
    fullSuit: "Full Suit Commission",
    partialSuit: "Partial Suit Commission",
    parts: "Parts Commission",
  };

  const thread = await createThread({
    kind: "commission",
    buyerUserId: user.id,
    buyerName: profile.fullName,
    buyerEmail: email,
    productName: ORDER_TYPE_LABELS[orderType] ?? "Custom Commission",
  });
  await addMessage(thread.id, { sender: "buyer", text: designNotes });

  await sendNotificationEmail({
    subject: `New commission quote request — ${profile.fullName}`,
    text,
    replyTo: email,
    attachments,
  });

  return NextResponse.json({ success: true });
}
