import { NextResponse } from "next/server";
import { addMessage, getThread, isValidThreadToken } from "@/lib/messages/store";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

// Tighter than the signed-in buyer limit — this endpoint has no account behind it to hold accountable.
const rateLimiter = getRateLimiter("messages-anon-send", 20, "10 m");

type RouteParams = { params: Promise<{ threadId: string }> };

/** Anonymous (contact-form) thread access — gated by the unguessable token in the request body instead of a Clerk session. */
export async function POST(request: Request, { params }: RouteParams) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { threadId } = await params;
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : null;

  const thread = await getThread(threadId);
  if (!thread || !isValidThreadToken(thread, token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const text = typeof body?.text === "string" ? body.text : undefined;
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : undefined;

  try {
    const message = await addMessage(threadId, { sender: "buyer", text, imageDataUrl });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "send_failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
