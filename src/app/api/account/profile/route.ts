import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/env";
import { validateAddress, validateDateOfBirth, type AccountAddress } from "@/lib/account/profile";

export async function POST(request: Request) {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const dateOfBirth = typeof body?.dateOfBirth === "string" ? body.dateOfBirth : "";

  if (!validateDateOfBirth(dateOfBirth)) {
    return NextResponse.json({ error: "invalid_date_of_birth" }, { status: 400 });
  }

  if (!validateAddress(body?.address)) {
    return NextResponse.json({ error: "invalid_address" }, { status: 400 });
  }

  const rawAddress = body.address as Record<string, string>;
  const address: AccountAddress = {
    line1: rawAddress.line1.trim(),
    line2: typeof rawAddress.line2 === "string" && rawAddress.line2.trim() ? rawAddress.line2.trim() : undefined,
    city: rawAddress.city.trim(),
    postalCode: rawAddress.postalCode.trim(),
    country: rawAddress.country.trim(),
  };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...user.privateMetadata,
      dateOfBirth,
      address,
    },
  });

  return NextResponse.json({ success: true });
}
