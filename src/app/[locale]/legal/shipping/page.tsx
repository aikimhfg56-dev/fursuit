import { getLocale, getTranslations } from "next-intl/server";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import type { Locale } from "@/i18n/routing";
import { formatPrice } from "@/lib/currency/format";
import { getPreferredCurrency } from "@/lib/currency/preference";
import { convertFromUsd } from "@/lib/currency/rates";
import { SHIPPING_REGIONS, getShippingRateUsd } from "@/lib/shipping/rates";

export default async function ShippingPolicyPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("legal.shipping");
  const currency = await getPreferredCurrency(locale);

  const rows = await Promise.all(
    SHIPPING_REGIONS.map(async (region) => ({
      region,
      label: t(`rates.regions.${region}`),
      price: formatPrice(await convertFromUsd(getShippingRateUsd(region), currency), currency, locale),
    })),
  );

  return (
    <LegalPageLayout title={t("title")} content={t("content")}>
      <h2 className="mt-10 text-lg font-semibold">{t("rates.heading")}</h2>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.region} className="border-b border-black/10 dark:border-white/10">
              <td className="py-2 text-black/80 dark:text-white/80">{row.label}</td>
              <td className="py-2 text-right font-medium">{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LegalPageLayout>
  );
}
