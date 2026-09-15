import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SELLER_SESSION_COOKIE = "seller_session";
export const SELLER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Minimal signed-cookie session for the seller admin — no user accounts, just
 * one shared passphrase (SELLER_ACCESS_CODE) checked at /seller/login. The
 * passphrase itself doubles as the HMAC key so a forged cookie would require
 * knowing it already.
 */
function sign(payload: string): string {
  const secret = process.env.SELLER_ACCESS_CODE;
  if (!secret) throw new Error("SELLER_ACCESS_CODE is not set");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSellerSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SELLER_SESSION_MAX_AGE_SECONDS * 1000 })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function isValidSellerSessionToken(token: string | undefined | null): boolean {
  if (!token || !process.env.SELLER_ACCESS_CODE) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

/** Reads the session cookie from the current request (Server Component, layout, or Route Handler). */
export async function hasSellerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSellerSessionToken(cookieStore.get(SELLER_SESSION_COOKIE)?.value);
}

export function isValidSellerAccessCode(candidate: string): boolean {
  const secret = process.env.SELLER_ACCESS_CODE;
  if (!secret || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
