import { cookies } from "next/headers";
import { localeConfig, type Locale } from "@/i18n/routing";
import { CURRENCY_COOKIE, SUPPORTED_CURRENCIES, type SupportedCurrency } from "./constants";

/** Shopper's manually chosen currency (cookie) if set, else the locale's default. */
export async function getPreferredCurrency(locale: Locale): Promise<SupportedCurrency> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CURRENCY_COOKIE)?.value;

  if (cookieValue && SUPPORTED_CURRENCIES.includes(cookieValue as SupportedCurrency)) {
    return cookieValue as SupportedCurrency;
  }

  return localeConfig[locale].defaultCurrency;
}
