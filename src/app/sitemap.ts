import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listPreorderProducts, listReadyMadeProducts } from "@/lib/sanity/queries";
import { getSiteUrl } from "@/lib/seo/site";

const STATIC_PATHS = [
  "",
  "/commission",
  "/commission/quote",
  "/shop",
  "/preorder",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
  "/legal/shipping",
  "/legal/returns",
  "/legal/cookies",
];

function alternatesFor(path: string, siteUrl: string) {
  return Object.fromEntries(routing.locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: { languages: alternatesFor(path, siteUrl) },
      });
    }
  }

  // Product detail pages are only fetched once Sanity is connected — both
  // helpers return [] until then, so this is a no-op until real products exist.
  const [readyMade, preorder] = await Promise.all([listReadyMadeProducts(), listPreorderProducts()]);

  for (const product of readyMade) {
    const path = `/shop/${product.slug}`;
    for (const locale of routing.locales) {
      entries.push({ url: `${siteUrl}/${locale}${path}`, alternates: { languages: alternatesFor(path, siteUrl) } });
    }
  }

  for (const product of preorder) {
    const path = `/preorder/${product.slug}`;
    for (const locale of routing.locales) {
      entries.push({ url: `${siteUrl}/${locale}${path}`, alternates: { languages: alternatesFor(path, siteUrl) } });
    }
  }

  return entries;
}
