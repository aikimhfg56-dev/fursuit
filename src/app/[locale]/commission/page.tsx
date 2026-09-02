import { getLocale, getTranslations } from "next-intl/server";
import ProcessSteps from "@/components/commission/ProcessSteps";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { getCommissionPage } from "@/lib/sanity/queries";

export default async function CommissionPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("commission");
  const cms = await getCommissionPage();

  const heroTitle = cms?.heroTitle ? pickLocaleValue(cms.heroTitle, locale) : t("title");
  const heroBody = cms?.heroBody ? pickLocaleValue(cms.heroBody, locale) : t("description");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{heroTitle}</h1>
        <p className="mx-auto mt-3 max-w-xl text-black/70 dark:text-white/70">{heroBody}</p>
        <Link
          href="/commission/quote"
          className="mt-8 inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          {t("cta")}
        </Link>
      </header>

      <div className="mt-16">
        <ProcessSteps steps={cms?.steps} locale={locale} />
      </div>
    </div>
  );
}
