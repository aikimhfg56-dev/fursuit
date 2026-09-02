import type { Locale } from "@/i18n/routing";
import type { LocaleString } from "@/lib/sanity/queries";

const BASE_LOCALE_KEY: Record<Locale, keyof LocaleString> = {
  "en-us": "en",
  "en-gb": "en",
  "en-au": "en",
  de: "de",
  fr: "fr",
  es: "es",
  ja: "ja",
};

/** Picks the field for the current site locale, falling back to English when a translation is missing. */
export function pickLocaleValue(value: LocaleString | undefined, locale: Locale): string {
  if (!value) return "";
  return value[BASE_LOCALE_KEY[locale]] || value.en || "";
}
