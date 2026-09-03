import { routing } from "@/i18n/routing";
import { getSiteUrl } from "./site";

/**
 * hreflang alternates for a locale-agnostic path (e.g. "/shop", "" for
 * home). Points search engines at the equivalent page in every one of the
 * 7 site locales, plus an x-default fallback to the US English version.
 */
export function buildAlternateLanguages(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}/${locale}${path}`;
  }

  languages["x-default"] = `${siteUrl}/${routing.defaultLocale}${path}`;
  return languages;
}
