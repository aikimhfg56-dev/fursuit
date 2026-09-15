import { NextResponse } from "next/server";
import { getThread, listMessages, markRead } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

type RouteParams = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const messages = await listMessages(threadId);
  await markRead(threadId, "seller");

  return NextResponse.json({ thread, messages });
}
