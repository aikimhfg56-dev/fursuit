import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/currency/format";
import { getPreferredCurrency } from "@/lib/currency/preference";
import { convertFromUsd } from "@/lib/currency/rates";

type PriceDisplayProps = {
  basePriceUsd: number;
  className?: string;
};

export default async function PriceDisplay({ basePriceUsd, className }: PriceDisplayProps) {
  const locale = (await getLocale()) as Locale;
  const currency = await getPreferredCurrency(locale);
  const amount = await convertFromUsd(basePriceUsd, currency);

  return <span className={className}>{formatPrice(amount, currency, locale)}</span>;
}
