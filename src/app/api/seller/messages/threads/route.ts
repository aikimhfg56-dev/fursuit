import { NextResponse } from "next/server";
import { isThreadUnread, listThreadsForSeller } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

export async function GET() {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const threads = await listThreadsForSeller();
  return NextResponse.json({
    threads: threads.map((thread) => ({ ...thread, unread: isThreadUnread(thread, "seller") })),
  });
}
