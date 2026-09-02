import type { User } from "@clerk/nextjs/server";

export type AccountAddress = {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
};

export type AccountProfile = {
  dateOfBirth?: string;
  address?: AccountAddress;
  stripeCustomerId?: string;
};

/**
 * Extended profile fields (DOB, address, linked Stripe customer) live in
 * Clerk's privateMetadata rather than a separate database — it's
 * server-only-readable, keeping this data out of the client bundle and out
 * of a second datastore we'd otherwise need to stand up just for this.
 */
export function getAccountProfile(user: User): AccountProfile {
  const metadata = user.privateMetadata as Record<string, unknown>;

  return {
    dateOfBirth: typeof metadata.dateOfBirth === "string" ? metadata.dateOfBirth : undefined,
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

export function isProfileComplete(profile: AccountProfile): boolean {
  return Boolean(profile.dateOfBirth && profile.address);
}

const MIN_ACCOUNT_AGE_YEARS = 13;

export function validateDateOfBirth(value: string): boolean {
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime()) || dob.getTime() > Date.now()) return false;

  const ageYears = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return ageYears >= MIN_ACCOUNT_AGE_YEARS;
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
