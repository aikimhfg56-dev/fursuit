import { defineRouting } from "next-intl/routing";

export const locales = [
  "en-us",
  "en-gb",
  "en-au",
  "de",
  "fr",
  "es",
  "ja",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-us";

export const localeConfig: Record<
  Locale,
  { label: string; defaultCurrency: "USD" | "GBP" | "EUR" | "AUD" | "JPY" }
> = {
  "en-us": { label: "English (US)", defaultCurrency: "USD" },
  "en-gb": { label: "English (UK)", defaultCurrency: "GBP" },
  "en-au": { label: "English (Australia)", defaultCurrency: "AUD" },
  de: { label: "Deutsch", defaultCurrency: "EUR" },
  fr: { label: "Français", defaultCurrency: "EUR" },
  es: { label: "Español", defaultCurrency: "EUR" },
  ja: { label: "日本語", defaultCurrency: "JPY" },
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
