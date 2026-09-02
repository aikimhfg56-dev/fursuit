import { getSanityClient } from "./client";

export type LocaleString = {
  en: string;
  de?: string;
  fr?: string;
  es?: string;
  ja?: string;
};

export type PromoCode = {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  active: boolean;
  expiresAt?: string;
  minOrderAmount?: number;
};

const PROMO_CODE_QUERY = `*[_type == "promoCode" && lower(code) == lower($code) && active == true][0]{
  _id, code, discountType, discountValue, active, expiresAt, minOrderAmount
}`;

/** Returns null if Sanity isn't configured yet, or no matching active code exists. */
export async function fetchPromoCode(code: string): Promise<PromoCode | null> {
  const client = getSanityClient();
  if (!client) return null;

  const result = await client.fetch<PromoCode | null>(PROMO_CODE_QUERY, { code });
  return result ?? null;
}
