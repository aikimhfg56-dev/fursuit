export type SupportedCurrency = "USD" | "GBP" | "EUR" | "AUD" | "JPY";

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ["USD", "GBP", "EUR", "AUD", "JPY"];

/** Cookie the shopper's manual currency choice is stored in (see CurrencySwitcher / lib/currency/preference.ts). */
export const CURRENCY_COOKIE = "NEXT_CURRENCY";
