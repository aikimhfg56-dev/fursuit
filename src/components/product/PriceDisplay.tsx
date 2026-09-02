import { useLocale } from "next-intl";
import { localeConfig, type Locale } from "@/i18n/routing";
import { convertFromUsd } from "@/lib/currency/staticRates";
import { formatPrice } from "@/lib/currency/format";

type PriceDisplayProps = {
  basePriceUsd: number;
  className?: string;
};

export default function PriceDisplay({ basePriceUsd, className }: PriceDisplayProps) {
  const locale = useLocale() as Locale;
  const currency = localeConfig[locale].defaultCurrency;
  const amount = convertFromUsd(basePriceUsd, currency);

  return <span className={className}>{formatPrice(amount, currency, locale)}</span>;
}
