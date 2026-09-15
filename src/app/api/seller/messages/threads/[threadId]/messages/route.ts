import { NextResponse } from "next/server";
import { addMessage, getThread } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

type RouteParams = { params: Promise<{ threadId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { threadId } = await params;
  if (!(await getThread(threadId))) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : undefined;
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : undefined;

  try {
    const message = await addMessage(threadId, { sender: "seller", text, imageDataUrl });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "send_failed";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
