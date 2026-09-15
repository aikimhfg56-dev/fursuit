import { NextResponse } from "next/server";
import { hasSellerSession } from "@/lib/seller/auth";
import { getSellerProduct, listSellerProducts, resolveImagesForSave, saveSellerProduct } from "@/lib/seller/store";
import { validateProductPayload } from "@/lib/seller/validation";

export async function GET(request: Request) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "shop" && kind !== "preorder") {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }

  return NextResponse.json({ products: await listSellerProducts(kind) });
}

export async function POST(request: Request) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const result = validateProductPayload(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { id, kind, input } = result.data;

  if (await getSellerProduct(kind, id)) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  try {
    const images = await resolveImagesForSave(input.images);
    const product = await saveSellerProduct(kind, id, { ...input, images });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
