import { NextResponse } from "next/server";
import { getSellerImage } from "@/lib/seller/store";

type RouteParams = { params: Promise<{ imageId: string }> };

/** Public by design — product photos need to render on the storefront for every visitor. */
export async function GET(_request: Request, { params }: RouteParams) {
  const { imageId } = await params;
  const image = await getSellerImage(imageId);
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(Buffer.from(image.data, "base64"), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
