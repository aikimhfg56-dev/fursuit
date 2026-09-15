import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSellerAuthConfigured } from "@/lib/env";
import { getClientIp, getRateLimiter } from "@/lib/rateLimit";
import { createSellerSessionToken, isValidSellerAccessCode, SELLER_SESSION_COOKIE, SELLER_SESSION_MAX_AGE_SECONDS } from "@/lib/seller/auth";

const rateLimiter = getRateLimiter("seller-login", 10, "10 m");

export async function POST(request: Request) {
  if (!isSellerAuthConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const { success } = await rateLimiter.limit(getClientIp(request));
  if (!success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";

  if (!isValidSellerAccessCode(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(SELLER_SESSION_COOKIE, createSellerSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SELLER_SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ success: true });
}
