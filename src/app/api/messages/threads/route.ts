import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/env";
import { isThreadUnread, listThreadsForBuyer } from "@/lib/messages/store";

export async function GET() {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const threads = await listThreadsForBuyer(user.id);
  return NextResponse.json({
    threads: threads.map((thread) => ({ ...thread, unread: isThreadUnread(thread, "buyer") })),
  });
}
