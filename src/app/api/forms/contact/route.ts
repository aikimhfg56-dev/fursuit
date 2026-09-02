import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const text = [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", message].join("\n");

  await sendNotificationEmail({
    subject: `New contact form message — ${subject}`,
    text,
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
