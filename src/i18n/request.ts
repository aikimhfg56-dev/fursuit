import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { mergeMessages } from "@/lib/i18n/mergeMessages";
import { routing, type Locale } from "./routing";

const EN_REGION_LOCALES = new Set<Locale>(["en-us", "en-gb", "en-au"]);

async function loadMessages(locale: Locale) {
  const base = (await import(`../../messages/en.json`)).default;

  if (EN_REGION_LOCALES.has(locale)) {
    const override = (await import(`../../messages/${locale}.json`)).default;
    return mergeMessages(base, override);
  }

  return (await import(`../../messages/${locale}.json`)).default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
