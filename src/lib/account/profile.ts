import type { User } from "@clerk/nextjs/server";

export type AccountAddress = {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export type AccountProfile = {
  fullName?: string;
  address?: AccountAddress;
  stripeCustomerId?: string;
};

/**
 * Shipping details (full name, address, linked Stripe customer) live in
 * Clerk's privateMetadata rather than a separate database — it's
 * server-only-readable, keeping this data out of the client bundle and out
 * of a second datastore we'd otherwise need to stand up just for this.
 * Unlike account identity (email/username), these are collected lazily at
 * checkout time, not at sign-up — see lib/account/shippingGate.ts.
 */
export function getAccountProfile(user: User): AccountProfile {
  const metadata = user.privateMetadata as Record<string, unknown>;

  return {
    fullName: typeof metadata.fullName === "string" ? metadata.fullName : undefined,
    address: isAccountAddress(metadata.address) ? metadata.address : undefined,
    stripeCustomerId: typeof metadata.stripeCustomerId === "string" ? metadata.stripeCustomerId : undefined,
  };
}

function isAccountAddress(value: unknown): value is AccountAddress {
  if (!value || typeof value !== "object") return false;
  const address = value as Record<string, unknown>;
  return (
    typeof address.line1 === "string" &&
    typeof address.city === "string" &&
    typeof address.postalCode === "string" &&
    typeof address.country === "string"
  );
}

export function hasShippingDetails(profile: AccountProfile): boolean {
  return Boolean(profile.fullName && profile.address);
}

export function validateFullName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateAddress(value: unknown): value is AccountAddress {
  if (!value || typeof value !== "object") return false;
  const address = value as Record<string, unknown>;
  return (
    typeof address.line1 === "string" &&
    address.line1.trim().length > 0 &&
    typeof address.city === "string" &&
    address.city.trim().length > 0 &&
    typeof address.postalCode === "string" &&
    address.postalCode.trim().length > 0 &&
    typeof address.country === "string" &&
    address.country.trim().length > 0
  );
}
