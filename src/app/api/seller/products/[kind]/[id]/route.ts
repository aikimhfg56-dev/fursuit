import { NextResponse } from "next/server";
import { hasSellerSession } from "@/lib/seller/auth";
import { deleteSellerProduct, resolveImagesForSave, saveSellerProduct, type SellerProductKind } from "@/lib/seller/store";
import { validateProductPayload } from "@/lib/seller/validation";

type RouteParams = { params: Promise<{ kind: string; id: string }> };

function parseKind(kind: string): SellerProductKind | null {
  return kind === "shop" || kind === "preorder" ? kind : null;
}

export async function PUT(request: Request, { params }: RouteParams) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { kind: kindParam, id } = await params;
  const kind = parseKind(kindParam);
  if (!kind) return NextResponse.json({ error: "invalid_kind" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const result = validateProductPayload({ ...(body as object), kind, id });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  try {
    const images = await resolveImagesForSave(result.data.input.images);
    const product = await saveSellerProduct(kind, id, { ...result.data.input, images });
    return NextResponse.json({ product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  if (!(await hasSellerSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { kind: kindParam, id } = await params;
  const kind = parseKind(kindParam);
  if (!kind) return NextResponse.json({ error: "invalid_kind" }, { status: 400 });

  await deleteSellerProduct(kind, id);
  return NextResponse.json({ success: true });
}
