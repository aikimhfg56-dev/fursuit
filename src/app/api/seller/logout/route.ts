import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SELLER_SESSION_COOKIE } from "@/lib/seller/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SELLER_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
