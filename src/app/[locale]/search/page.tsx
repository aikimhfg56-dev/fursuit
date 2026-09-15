import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import ProductGrid from "@/components/product/ProductGrid";
import SearchForm from "@/components/product/SearchForm";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { getPreorderCatalog, getShopCatalog } from "@/lib/products/catalog";
import { buildAlternateLanguages } from "@/lib/seo/alternates";
import type { PreorderProductSummary, ProductSummary } from "@/lib/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return { title: t("title"), alternates: { languages: buildAlternateLanguages("/search") } };
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

function matchesQuery<T extends ProductSummary>(products: T[], query: string, locale: Locale): T[] {
  const needle = query.toLowerCase();
  return products.filter((product) => pickLocaleValue(product.name, locale).toLowerCase().includes(needle));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("search");
  const tShop = await getTranslations("shop");
  const tPreorder = await getTranslations("preorder");
  const locale = (await getLocale()) as Locale;
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [shopCatalog, preorderCatalog] = await Promise.all([getShopCatalog(), getPreorderCatalog()]);

  const shopMatches: ProductSummary[] = query ? matchesQuery(shopCatalog.products, query, locale) : [];
  const preorderMatches: PreorderProductSummary[] = query
    ? matchesQuery(preorderCatalog.products, query, locale)
    : [];
  const hasResults = shopMatches.length > 0 || preorderMatches.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <SearchForm defaultValue={query} placeholder={t("placeholder")} submitLabel={t("submit")} />
      </header>

      {!query ? (
        <p className="py-16 text-center text-sm text-black/60">{t("prompt")}</p>
      ) : !hasResults ? (
        <p className="py-16 text-center text-sm text-black/60">{t("empty", { query })}</p>
      ) : (
        <div className="space-y-16">
          {shopMatches.length > 0 && (
            <section>
              <h2 className="mb-6 text-xl font-semibold">{tShop("title")}</h2>
              <ProductGrid products={shopMatches} kind="shop" />
            </section>
          )}
          {preorderMatches.length > 0 && (
            <section>
              <h2 className="mb-6 text-xl font-semibold">{tPreorder("title")}</h2>
              <ProductGrid products={preorderMatches} kind="preorder" />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
