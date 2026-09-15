import type { Locale } from "@/i18n/routing";
import type { SupportedCurrency } from "./constants";

/** All prices and checkouts are fixed to USD regardless of locale. */
export async function getPreferredCurrency(_locale: Locale): Promise<SupportedCurrency> {
  return "USD";
}
