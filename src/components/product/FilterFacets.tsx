"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import type { TaxonomyTerm } from "@/lib/sanity/queries";

type FilterFacetsProps = {
  categories: TaxonomyTerm[];
  styleTags: TaxonomyTerm[];
};

export default function FilterFacets({ categories, styleTags }: FilterFacetsProps) {
  const t = useTranslations("product.filters");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category");
  const activeStyle = searchParams.get("style");

  function setParam(key: "category" | "style", value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  if (categories.length === 0 && styleTags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-black/10 pb-6 dark:border-white/10">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill active={!activeCategory} label={t("all")} onClick={() => setParam("category", null)} />
          {categories.map((category) => (
            <FilterPill
              key={category.slug}
              active={activeCategory === category.slug}
              label={pickLocaleValue(category.title, locale)}
              onClick={() => setParam("category", category.slug)}
            />
          ))}
        </div>
      )}
      {styleTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {styleTags.map((style) => (
            <FilterPill
              key={style.slug}
              active={activeStyle === style.slug}
              label={pickLocaleValue(style.title, locale)}
              onClick={() => setParam("style", activeStyle === style.slug ? null : style.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
          : "border-black/15 dark:border-white/20"
      }`}
    >
      {label}
    </button>
  );
}
