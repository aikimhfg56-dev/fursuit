/**
 * Placeholder fixed USD-based rates for showing approximate catalog prices
 * before Milestone 5 wires up a live, daily-cached FX API. Not used for any
 * actual charge amount — checkout always sends basePrice (USD) server-side.
 */
const STATIC_USD_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.53,
  JPY: 149,
};

export function convertFromUsd(amountUsd: number, currency: string): number {
  const rate = STATIC_USD_RATES[currency] ?? 1;
  return amountUsd * rate;
}
