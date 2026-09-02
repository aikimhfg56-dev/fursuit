import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const orderAmountUsd = Number(body?.orderAmountUsd);

  if (!code || !Number.isFinite(orderAmountUsd) || orderAmountUsd <= 0) {
    return NextResponse.json({ valid: false, reason: "invalid_request" }, { status: 400 });
  }

  const result = await validatePromoCode(code, orderAmountUsd);
  return NextResponse.json(result);
}
