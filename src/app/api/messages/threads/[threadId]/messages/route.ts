import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/env";
import { addMessage, getThread } from "@/lib/messages/store";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("messages-send", 30, "1 m");

type RouteParams = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread || thread.buyerUserId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
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
