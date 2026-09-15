import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/env";
import { getThread, listMessages, markRead } from "@/lib/messages/store";

type RouteParams = { params: Promise<{ threadId: string }> };

/** Fetches a thread's messages and marks it read for the buyer in the same call — this is what the polling chat UI hits every few seconds. */
export async function GET(_request: Request, { params }: RouteParams) {
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

  const messages = await listMessages(threadId);
  await markRead(threadId, "buyer");

  return NextResponse.json({ thread, messages });
}
