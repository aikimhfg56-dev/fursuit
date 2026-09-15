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
import {
  SAMPLE_CATEGORIES,
  SAMPLE_PREORDER_PRODUCTS,
  SAMPLE_READY_MADE_PRODUCTS,
  SAMPLE_STYLE_TAGS,
} from "@/lib/sanity/sampleProducts";
import { getSellerProduct, listSellerProducts, toProductDetail } from "@/lib/seller/store";

export type Catalog<T> = { products: T[]; categories: TaxonomyTerm[]; styleTags: TaxonomyTerm[] };

/**
 * Every listing page follows the same three-tier fallback: real Sanity data
 * once it's connected, otherwise whatever the seller has added through
 * /seller, otherwise the static sample catalog so the layout still has
 * something to show.
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

  const sellerProducts = isUpstashConfigured() ? await listSellerProducts("shop") : [];
  const products = sellerProducts.length > 0 ? sellerProducts.map(toProductDetail) : SAMPLE_READY_MADE_PRODUCTS;
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

  const sellerProducts = isUpstashConfigured() ? await listSellerProducts("preorder") : [];
  const products =
    sellerProducts.length > 0
      ? (sellerProducts.map(toProductDetail) as PreorderProductSummary[])
      : SAMPLE_PREORDER_PRODUCTS;
  return { products, categories: SAMPLE_CATEGORIES, styleTags: SAMPLE_STYLE_TAGS };
}

export async function getShopProductDetail(slug: string): Promise<ProductDetail | null> {
  if (isSanityConfigured()) return getReadyMadeProductBySlug(slug);

  if (isUpstashConfigured()) {
    const sellerProduct = await getSellerProduct("shop", slug);
    if (sellerProduct) return toProductDetail(sellerProduct) as ProductDetail;
  }

  return SAMPLE_READY_MADE_PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export async function getPreorderProductDetail(slug: string): Promise<PreorderProductDetail | null> {
  if (isSanityConfigured()) return getPreorderProductBySlug(slug);

  if (isUpstashConfigured()) {
    const sellerProduct = await getSellerProduct("preorder", slug);
    if (sellerProduct) return toProductDetail(sellerProduct) as PreorderProductDetail;
  }

  return SAMPLE_PREORDER_PRODUCTS.find((product) => product.slug === slug) ?? null;
}
