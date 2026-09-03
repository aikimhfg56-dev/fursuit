import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/email/resend";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("forms-quote", 3, "10 m");

export async function POST(request: Request) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const characterDescription =
    typeof body?.characterDescription === "string" ? body.characterDescription.trim() : "";

  if (!name || !email || !characterDescription) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const country = typeof body?.country === "string" ? body.country.trim() : "";
  const budget = typeof body?.budget === "string" ? body.budget.trim() : "";
  const timeline = typeof body?.timeline === "string" ? body.timeline.trim() : "";
  const referenceLinks = typeof body?.referenceLinks === "string" ? body.referenceLinks.trim() : "";

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Country: ${country || "-"}`,
    `Budget: ${budget || "-"}`,
    `Timeline: ${timeline || "-"}`,
    `Reference links: ${referenceLinks || "-"}`,
    "",
    "Character description:",
    characterDescription,
  ].join("\n");

  await sendNotificationEmail({
    subject: `New commission quote request — ${name}`,
    text,
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
