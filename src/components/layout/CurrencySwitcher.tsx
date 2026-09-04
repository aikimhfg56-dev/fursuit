"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CURRENCY_COOKIE, SUPPORTED_CURRENCIES } from "@/lib/currency/constants";

type CurrencySwitcherProps = {
  currentCurrency: string;
};

export default function CurrencySwitcher({ currentCurrency }: CurrencySwitcherProps) {
  const t = useTranslations("common");
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `${CURRENCY_COOKIE}=${event.target.value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("currency")}</span>
      <select
        value={currentCurrency}
        onChange={handleChange}
        className="rounded border border-border/40 bg-transparent px-2 py-1 text-sm"
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </label>
  );
}
