import { getSanityClient } from "./client";

export type LocaleString = {
  en: string;
  de?: string;
  fr?: string;
  es?: string;
  ja?: string;
};

export type LocaleText = LocaleString;

export type SanityImageRef = {
  asset?: { _ref: string; _type: "reference"; _id?: string };
  [key: string]: unknown;
};

export type ProductStockStatus = "in_stock" | "low_stock" | "sold_out";
export type ProductFlag = "new_arrival" | "flash_sale" | "clearance";
export type PreorderStatus = "open" | "closing_soon" | "closed" | "in_production";

export type TaxonomyTerm = {
  title: LocaleString;
  slug: string;
};

export type ProductSummary = {
  _id: string;
  name: LocaleString;
  slug: string;
  images: SanityImageRef[];
  basePrice: number;
  stockStatus: ProductStockStatus;
  flags?: ProductFlag[];
  speciesTag?: string;
  category?: TaxonomyTerm | null;
  styleTags?: TaxonomyTerm[];
};

export type ProductDetail = ProductSummary & {
  description?: LocaleText;
};

export type PreorderProductSummary = ProductSummary & {
  expectedShipWindowStart?: string;
  expectedShipWindowEnd?: string;
  preorderStatus?: PreorderStatus;
};

export type PreorderProductDetail = PreorderProductSummary & {
  description?: LocaleText;
};

export type PromoCode = {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  active: boolean;
  expiresAt?: string;
  minOrderAmount?: number;
};

const PRODUCT_SUMMARY_FIELDS = `
  _id,
  name,
  "slug": slug.current,
  images,
  basePrice,
  stockStatus,
  flags,
  speciesTag,
  "category": category->{ title, "slug": slug.current },
  "styleTags": styleTags[]->{ title, "slug": slug.current }
`;

const PRODUCT_DETAIL_FIELDS = `${PRODUCT_SUMMARY_FIELDS}, description`;

const PREORDER_SUMMARY_FIELDS = `${PRODUCT_SUMMARY_FIELDS}, expectedShipWindowStart, expectedShipWindowEnd, preorderStatus`;

const PREORDER_DETAIL_FIELDS = `${PREORDER_SUMMARY_FIELDS}, description`;

/** Returns [] until Sanity is connected, so catalog pages can render an empty/"not connected" state. */
export async function listReadyMadeProducts(): Promise<ProductSummary[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch(
    `*[_type == "readyMadeProduct"] | order(publishedAt desc) { ${PRODUCT_SUMMARY_FIELDS} }`,
  );
}

export async function getReadyMadeProductBySlug(slug: string): Promise<ProductDetail | null> {
  const client = getSanityClient();
  if (!client) return null;

  const result = await client.fetch(
    `*[_type == "readyMadeProduct" && slug.current == $slug][0]{ ${PRODUCT_DETAIL_FIELDS} }`,
    { slug },
  );
  return result ?? null;
}

export async function listPreorderProducts(): Promise<PreorderProductSummary[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch(
    `*[_type == "preorderProduct"] | order(publishedAt desc) { ${PREORDER_SUMMARY_FIELDS} }`,
  );
}

export async function getPreorderProductBySlug(slug: string): Promise<PreorderProductDetail | null> {
  const client = getSanityClient();
  if (!client) return null;

  const result = await client.fetch(
    `*[_type == "preorderProduct" && slug.current == $slug][0]{ ${PREORDER_DETAIL_FIELDS} }`,
    { slug },
  );
  return result ?? null;
}

export async function listCategories(): Promise<TaxonomyTerm[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch(`*[_type == "category"] | order(sortOrder asc){ title, "slug": slug.current }`);
}

export async function listStyleTags(): Promise<TaxonomyTerm[]> {
  const client = getSanityClient();
  if (!client) return [];

  return client.fetch(`*[_type == "styleTag"]{ title, "slug": slug.current }`);
}

const PROMO_CODE_QUERY = `*[_type == "promoCode" && lower(code) == lower($code) && active == true][0]{
  _id, code, discountType, discountValue, active, expiresAt, minOrderAmount
}`;

/** Returns null if Sanity isn't configured yet, or no matching active code exists. */
export async function fetchPromoCode(code: string): Promise<PromoCode | null> {
  const client = getSanityClient();
  if (!client) return null;

  const result = await client.fetch<PromoCode | null>(PROMO_CODE_QUERY, { code });
  return result ?? null;
}

export type CommissionStep = {
  stepNumber: number;
  title: LocaleString;
  description: LocaleText;
};

export type CommissionPageContent = {
  heroTitle?: LocaleString;
  heroBody?: LocaleText;
  steps?: CommissionStep[];
};

/** Returns null if Sanity isn't configured yet, or the singleton hasn't been created — callers fall back to static copy. */
export async function getCommissionPage(): Promise<CommissionPageContent | null> {
  const client = getSanityClient();
  if (!client) return null;

  const result = await client.fetch<CommissionPageContent | null>(
    `*[_type == "commissionPage"][0]{ heroTitle, heroBody, steps }`,
  );
  return result ?? null;
}
