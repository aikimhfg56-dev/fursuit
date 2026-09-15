import { NextResponse } from "next/server";
import { getThread, isValidThreadToken, listMessages, markRead } from "@/lib/messages/store";

type RouteParams = { params: Promise<{ threadId: string }> };

/** Anonymous (contact-form) thread access — gated by the unguessable token in the URL instead of a Clerk session. */
export async function GET(request: Request, { params }: RouteParams) {
  const { threadId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  const thread = await getThread(threadId);
  if (!thread || !isValidThreadToken(thread, token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const messages = await listMessages(threadId);
  await markRead(threadId, "buyer");

  return NextResponse.json({ thread, messages });
}
