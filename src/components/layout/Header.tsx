import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPreferredCurrency } from "@/lib/currency/preference";
import CurrencySwitcher from "./CurrencySwitcher";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Header() {
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;
  const currency = await getPreferredCurrency(locale);

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fursuit Studio
        </Link>
        <nav className="flex flex-wrap items-center gap-6 text-sm">
          <Link href="/commission">{t("commission")}</Link>
          <Link href="/shop">{t("shop")}</Link>
          <Link href="/preorder">{t("preorder")}</Link>
          <Link href="/contact">{t("contact")}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <CurrencySwitcher currentCurrency={currency} />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
