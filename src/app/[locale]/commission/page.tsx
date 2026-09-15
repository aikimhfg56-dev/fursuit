import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import ProcessSteps from "@/components/commission/ProcessSteps";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { COMMISSION_STARTING_PRICES } from "@/lib/commission/startingPrices";
import { formatPrice } from "@/lib/currency/format";
import { getPreferredCurrency } from "@/lib/currency/preference";
import { convertFromUsd } from "@/lib/currency/rates";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { buildAlternateLanguages } from "@/lib/seo/alternates";
import { getCommissionPage } from "@/lib/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("commission");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: buildAlternateLanguages("/commission") },
  };
}

export default async function CommissionPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("commission");
  const cms = await getCommissionPage();
  const currency = await getPreferredCurrency(locale);

  const heroTitle = cms?.heroTitle ? pickLocaleValue(cms.heroTitle, locale) : t("title");
  const heroBody = cms?.heroBody ? pickLocaleValue(cms.heroBody, locale) : t("description");

  const priceRows = await Promise.all(
    COMMISSION_STARTING_PRICES.map(async (item) => ({
      key: item.key,
      label: t(`startingPrices.items.${item.key}`),
      price: t("startingPrices.priceFrom", {
        price: formatPrice(await convertFromUsd(item.usd, currency), currency, locale),
      }),
    })),
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{heroTitle}</h1>
        <p className="mx-auto mt-3 max-w-xl text-black/70">{heroBody}</p>
        <Link
          href="/commission/quote"
          className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
        >
          {t("cta")}
        </Link>
      </header>

      <div className="mx-auto mt-12 max-w-md">
        <h2 className="text-center text-lg font-semibold">{t("startingPrices.heading")}</h2>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {priceRows.map((row) => (
              <tr key={row.key} className="border-b border-black/10">
                <td className="py-2 text-black/80">{row.label}</td>
                <td className="py-2 text-right font-medium">{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-16">
        <ProcessSteps steps={cms?.steps} locale={locale} />
      </div>
    </div>
  );
}
