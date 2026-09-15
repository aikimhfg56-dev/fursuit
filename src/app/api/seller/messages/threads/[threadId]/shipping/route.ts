import { NextResponse } from "next/server";
import { addMessage, getThread, setTrackingNumber } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

type RouteParams = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread || thread.kind === "contact") return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const trackingNumber = typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (!trackingNumber) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const updated = await setTrackingNumber(threadId, trackingNumber);
  // Surfaces the update in the conversation itself, not just the banner, so the buyer notices it via
  // their existing unread/polling flow. In English (unlike the rest of the seller admin UI) since this
  // message lands in the buyer's own chat thread, not the seller's Japanese-only admin chrome.
  const message = await addMessage(threadId, {
    sender: "seller",
    text: `📦 Shipped! Tracking number: ${trackingNumber}`,
  });

  return NextResponse.json({ thread: updated, message });
}
