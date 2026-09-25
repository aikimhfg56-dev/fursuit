import { isSanityConfigured, isUpstashConfigured } from "@/lib/env";
import {
  getPreorderProductBySlug,
  getReadyMadeProductBySlug,
  listCategories,
  listPreorderProducts,
  listReadyMadeProducts,
  listStyleTags,
  type PreorderProductDetail,
  type PreorderProductSummary,
  type ProductDetail,
  type ProductSummary,
  type TaxonomyTerm,
} from "@/lib/sanity/queries";
import { SAMPLE_CATEGORIES, SAMPLE_STYLE_TAGS } from "@/lib/sanity/sampleProducts";
import { getSellerProduct, listSellerProducts, toProductDetail } from "@/lib/seller/store";

export type Catalog<T> = { products: T[]; categories: TaxonomyTerm[]; styleTags: TaxonomyTerm[] };

/**
 * Every listing page follows the same two-tier fallback: real Sanity data
 * once it's connected, otherwise whatever the seller has added through
 * /seller. An empty result renders the "no products yet" state — never
 * placeholder content.
 */
export async function getShopCatalog(): Promise<Catalog<ProductSummary>> {
  if (isSanityConfigured()) {
    const [products, categories, styleTags] = await Promise.all([
      listReadyMadeProducts(),
      listCategories(),
      listStyleTags(),
    ]);
    return { products, categories, styleTags };
  }

  const products = isUpstashConfigured() ? (await listSellerProducts("shop")).map(toProductDetail) : [];
  return { products, categories: SAMPLE_CATEGORIES, styleTags: SAMPLE_STYLE_TAGS };
}

export async function getPreorderCatalog(): Promise<Catalog<PreorderProductSummary>> {
  if (isSanityConfigured()) {
    const [products, categories, styleTags] = await Promise.all([
      listPreorderProducts(),
      listCategories(),
      listStyleTags(),
    ]);
    return { products, categories, styleTags };
  }

  const products = isUpstashConfigured()
    ? ((await listSellerProducts("preorder")).map(toProductDetail) as PreorderProductSummary[])
    : [];
  return { products, categories: SAMPLE_CATEGORIES, styleTags: SAMPLE_STYLE_TAGS };
}

export async function getShopProductDetail(slug: string): Promise<ProductDetail | null> {
  if (isSanityConfigured()) return getReadyMadeProductBySlug(slug);

  if (isUpstashConfigured()) {
    const sellerProduct = await getSellerProduct("shop", slug);
    if (sellerProduct) return toProductDetail(sellerProduct) as ProductDetail;
  }

  return null;
}

export async function getPreorderProductDetail(slug: string): Promise<PreorderProductDetail | null> {
  if (isSanityConfigured()) return getPreorderProductBySlug(slug);

  if (isUpstashConfigured()) {
    const sellerProduct = await getSellerProduct("preorder", slug);
    if (sellerProduct) return toProductDetail(sellerProduct) as PreorderProductDetail;
  }

  return null;
}
