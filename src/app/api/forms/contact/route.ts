import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/email/resend";
import { addMessage, createThread } from "@/lib/messages/store";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("forms-contact", 5, "10 m");

export async function POST(request: Request) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const text = [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", message].join("\n");

  // No account exists at this point — the thread is keyed by the access
  // token below instead, which is the only thing that lets this specific
  // sender (and no one else) continue the conversation.
  const thread = await createThread({ kind: "contact", buyerName: name, buyerEmail: email, productName: subject });
  await addMessage(thread.id, { sender: "buyer", text: message });

  await sendNotificationEmail({
    subject: `New contact form message — ${subject}`,
    text,
    replyTo: email,
  });

  return NextResponse.json({ success: true, threadId: thread.id, token: thread.accessToken });
}
