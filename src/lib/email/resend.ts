import { Resend } from "resend";
import { isResendConfigured } from "@/lib/env";

let cachedClient: Resend | null = null;

/** Returns null until RESEND_API_KEY is set. */
export function getResendClient(): Resend | null {
  if (!isResendConfigured()) return null;

  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY!);
  }

  return cachedClient;
}

export type NotificationEmailAttachment = {
  filename: string;
  content: Buffer;
};

export type NotificationEmailInput = {
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: NotificationEmailAttachment[];
};

/**
 * Sends an internal notification (order confirmation, quote/contact form
 * submission) to CONTACT_NOTIFICATION_EMAIL. No-ops with a console log until
 * Resend is connected, so form/checkout flows don't break in the meantime.
 */
export async function sendNotificationEmail(input: NotificationEmailInput): Promise<void> {
  const client = getResendClient();
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!client || !to) {
    console.warn("[email] Resend not configured yet, email not sent:", input);
    return;
  }

  await client.emails.send({
    from: "Fursuit Studio <onboarding@resend.dev>",
    to,
    subject: input.subject,
    text: input.text,
    replyTo: input.replyTo,
    attachments: input.attachments,
  });
}
