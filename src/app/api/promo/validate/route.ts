import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo/validatePromoCode";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";

const rateLimiter = getRateLimiter("promo-validate", 20, "1 m");

export async function POST(request: Request) {
  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ valid: false, reason: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  const orderAmountUsd = Number(body?.orderAmountUsd);

  if (!code || !Number.isFinite(orderAmountUsd) || orderAmountUsd <= 0) {
    return NextResponse.json({ valid: false, reason: "invalid_request" }, { status: 400 });
  }

  const result = await validatePromoCode(code, orderAmountUsd);
  return NextResponse.json(result);
}
