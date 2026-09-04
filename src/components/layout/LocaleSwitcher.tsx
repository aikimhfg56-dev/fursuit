"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeConfig, type Locale } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(event) =>
          router.replace(pathname, { locale: event.target.value as Locale })
        }
        className="rounded border border-border/40 bg-transparent px-2 py-1 text-sm"
      >
        {locales.map((value) => (
          <option key={value} value={value}>
            {localeConfig[value].label}
          </option>
        ))}
      </select>
    </label>
  );
}
