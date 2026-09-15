import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { resolveProductImageUrl } from "@/lib/sanity/image";
import type { PreorderProductSummary, ProductSummary } from "@/lib/sanity/queries";
import PriceDisplay from "./PriceDisplay";
import ProductImagePlaceholder from "./ProductImagePlaceholder";

type ProductCardProps = {
  product: ProductSummary | PreorderProductSummary;
  kind: "shop" | "preorder";
};

export default function ProductCard({ product, kind }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const name = pickLocaleValue(product.name, locale);
  const categoryName = product.category ? pickLocaleValue(product.category.title, locale) : undefined;
  const subtitle = [categoryName, product.speciesTag].filter(Boolean).join(" · ");
  const imageUrl = product.images?.[0] ? resolveProductImageUrl(product.images[0], 600) : undefined;

  const badges: string[] = [];
  if (product.stockStatus === "sold_out") badges.push(t("stockStatus.sold_out"));
  else if (product.stockStatus === "low_stock") badges.push(t("stockStatus.low_stock"));
  for (const flag of product.flags ?? []) badges.push(t(`flags.${flag}`));
  if (kind === "preorder") {
    const preorderStatus = (product as PreorderProductSummary).preorderStatus;
    if (preorderStatus) badges.push(t(`preorderStatus.${preorderStatus}`));
  }

  return (
    <Link
      href={`/${kind}/${product.slug}`}
      className="group block text-center transition duration-300 ease-out hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-card-background transition-shadow duration-300 group-hover:shadow-lg">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={600}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ProductImagePlaceholder label={t("imageComingSoon")} />
        )}
      </div>
      <div className="mt-4">
        <p className="text-base font-bold uppercase tracking-wide">{name}</p>
        {subtitle && <p className="mt-1 text-xs text-black/50">{subtitle}</p>}
        <PriceDisplay basePriceUsd={product.basePrice} className="mt-1 text-sm text-black/60" />
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-black/60"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
