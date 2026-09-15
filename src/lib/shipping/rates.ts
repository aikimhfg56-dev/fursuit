import type { SupportedCurrency } from "@/lib/currency/constants";
import { localeConfig, type Locale } from "@/i18n/routing";

export type ShippingRegion = "US" | "EU" | "UK" | "AU" | "OTHER";

export const SHIPPING_REGIONS: ShippingRegion[] = ["US", "EU", "UK", "AU", "OTHER"];

/**
 * Flat-rate shipping by region (MVP simplification per the plan — a real
 * carrier-rate API integration comes later). Priced in USD; converted to
 * the shopper's display currency alongside product prices.
 */
const SHIPPING_RATES_USD: Record<ShippingRegion, number> = {
  US: 25,
  EU: 35,
  UK: 35,
  AU: 40,
  OTHER: 45,
};

export function getShippingRateUsd(region: ShippingRegion): number {
  return SHIPPING_RATES_USD[region];
}

function regionForCurrency(currency: SupportedCurrency): ShippingRegion {
  switch (currency) {
    case "USD":
      return "US";
    case "GBP":
      return "UK";
    case "EUR":
      return "EU";
    case "AUD":
      return "AU";
    default:
      return "OTHER";
  }
}

/** Currency is a reasonable proxy for delivery region without collecting an address up front. */
export function getShippingRegionForCurrency(currency: SupportedCurrency): ShippingRegion {
  return regionForCurrency(currency);
}

/**
 * Prices are fixed to USD, so the shopper's currency can no longer stand in
 * for their delivery region — fall back to the site locale's default
 * currency instead, which is still a reasonable proxy without collecting an
 * address up front.
 */
export function getShippingRegionForLocale(locale: Locale): ShippingRegion {
  return regionForCurrency(localeConfig[locale].defaultCurrency);
}
