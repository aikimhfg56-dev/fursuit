import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { urlForImage } from "@/lib/sanity/image";
import type { PreorderProductSummary, ProductSummary } from "@/lib/sanity/queries";
import PriceDisplay from "./PriceDisplay";

type ProductCardProps = {
  product: ProductSummary | PreorderProductSummary;
  kind: "shop" | "preorder";
};

export default function ProductCard({ product, kind }: ProductCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("product");
  const name = pickLocaleValue(product.name, locale);
  const imageUrl = product.images?.[0]
    ? urlForImage(product.images[0])?.width(600).height(600).fit("crop").url()
    : undefined;

  const badges: string[] = [];
  if (product.stockStatus === "sold_out") badges.push(t("stockStatus.sold_out"));
  else if (product.stockStatus === "low_stock") badges.push(t("stockStatus.low_stock"));
  for (const flag of product.flags ?? []) badges.push(t(`flags.${flag}`));
  if (kind === "preorder") {
    const preorderStatus = (product as PreorderProductSummary).preorderStatus;
    if (preorderStatus) badges.push(t(`preorderStatus.${preorderStatus}`));
  }

  return (
    <Link href={`/${kind}/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={600}
            height={600}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-black/40 dark:text-white/40">
            {name}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium">{name}</p>
        <PriceDisplay basePriceUsd={product.basePrice} className="text-sm text-black/60 dark:text-white/60" />
        {badges.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-black/60 dark:border-white/20 dark:text-white/60"
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
