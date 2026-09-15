import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isClerkConfigured } from "@/lib/env";
import { getMessageImage, getThread, isValidThreadToken } from "@/lib/messages/store";
import { hasSellerSession } from "@/lib/seller/auth";

type RouteParams = { params: Promise<{ imageId: string }> };

/** Served only to the seller admin session or whoever the image's own thread belongs to — chat photos aren't public like storefront product photos. */
export async function GET(request: Request, { params }: RouteParams) {
  const { imageId } = await params;
  const image = await getMessageImage(imageId);
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isSeller = await hasSellerSession();
  if (!isSeller) {
    const thread = await getThread(image.threadId);
    const token = new URL(request.url).searchParams.get("token");
    const user = isClerkConfigured() ? await currentUser() : null;

    const isOwner = Boolean(thread) && (thread!.buyerUserId === user?.id || isValidThreadToken(thread!, token));
    if (!isOwner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return new NextResponse(Buffer.from(image.data, "base64"), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
