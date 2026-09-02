import { getTranslations } from "next-intl/server";
import FilterFacets from "@/components/product/FilterFacets";
import ProductGrid from "@/components/product/ProductGrid";
import PagePlaceholder from "@/components/shared/PagePlaceholder";
import TrustBadges from "@/components/shared/TrustBadges";
import { isSanityConfigured } from "@/lib/env";
import { listCategories, listReadyMadeProducts, listStyleTags } from "@/lib/sanity/queries";

type ShopPageProps = {
  searchParams: Promise<{ category?: string; style?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const t = await getTranslations("shop");
  const tc = await getTranslations("common");
  const tp = await getTranslations("product");

  if (!isSanityConfigured()) {
    return (
      <PagePlaceholder
        title={t("title")}
        description={tp("catalogNotConnected.description")}
        comingSoon={tc("comingSoon")}
      />
    );
  }

  const { category, style } = await searchParams;
  const [products, categories, styleTags] = await Promise.all([
    listReadyMadeProducts(),
    listCategories(),
    listStyleTags(),
  ]);

  const filteredProducts = products.filter((product) => {
    if (category && product.category?.slug !== category) return false;
    if (style && !(product.styleTags ?? []).some((tag) => tag.slug === style)) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-2 text-black/70 dark:text-white/70">{t("description")}</p>
      </header>

      <FilterFacets categories={categories} styleTags={styleTags} />

      <div className="mt-8">
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} kind="shop" />
        ) : (
          <p className="py-16 text-center text-sm text-black/60 dark:text-white/60">{tp("empty")}</p>
        )}
      </div>

      <div className="mt-16">
        <TrustBadges />
      </div>
    </div>
  );
}
