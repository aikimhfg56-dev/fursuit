import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Routes are locale-prefixed (e.g. /en-us/account), hence the "/*/" wildcards.
        disallow: ["/api/", "/*/account", "/*/sign-in", "/*/sign-up", "/*/checkout/success"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
