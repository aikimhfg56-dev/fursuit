import type { SupportedCurrency } from "./constants";

/** Used when the live rate fetch fails, so pricing degrades to "briefly stale" instead of breaking. */
const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  AUD: 1.53,
  JPY: 149,
};

type FrankfurterResponse = { rates: Record<string, number> };

/**
 * Daily-cached USD-based FX rates from Frankfurter (ECB reference rates,
 * no API key required — see .env.local.example's EXCHANGE_RATE_API_KEY if
 * this ever needs to move to a keyed provider instead).
 */
export async function getExchangeRates(): Promise<Record<SupportedCurrency, number>> {
  try {
    const response = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=GBP,EUR,AUD,JPY", {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) throw new Error(`Frankfurter request failed: ${response.status}`);

    const data = (await response.json()) as FrankfurterResponse;
    return { ...FALLBACK_RATES, ...data.rates, USD: 1 } as Record<SupportedCurrency, number>;
  } catch (error) {
    console.warn("[currency] Falling back to static FX rates:", error);
    return FALLBACK_RATES;
  }
}

export async function convertFromUsd(amountUsd: number, currency: SupportedCurrency): Promise<number> {
  const rates = await getExchangeRates();
  return amountUsd * (rates[currency] ?? 1);
}
