import { getRedisClient } from "@/lib/upstash";
import type {
  PreorderProductDetail,
  PreorderStatus,
  ProductDetail,
  ProductFlag,
  ProductStockStatus,
} from "@/lib/sanity/queries";
import { SAMPLE_CATEGORIES, SAMPLE_STYLE_TAGS } from "@/lib/sanity/sampleProducts";

export type SellerProductKind = "shop" | "preorder";

export type SellerProductInput = {
  name: string;
  description?: string;
  images: string[];
  basePrice: number;
  /** Used to calculate real EMS international shipping rates. */
  weightKg?: number;
  stockStatus: ProductStockStatus;
  category?: string;
  speciesTag?: string;
  styleTags?: string[];
  flags?: ProductFlag[];
  preorderStatus?: PreorderStatus;
  expectedShipWindowStart?: string;
  expectedShipWindowEnd?: string;
};

export type SellerProductRecord = SellerProductInput & {
  id: string;
  kind: SellerProductKind;
  createdAt: string;
  updatedAt: string;
};

const PRODUCT_IDS_KEY = (kind: SellerProductKind) => `seller:products:${kind}`;
const PRODUCT_KEY = (kind: SellerProductKind, id: string) => `seller:product:${kind}:${id}`;
const IMAGE_KEY = (imageId: string) => `seller:image:${imageId}`;

export async function listSellerProducts(kind: SellerProductKind): Promise<SellerProductRecord[]> {
  const redis = getRedisClient();
  const ids = await redis.smembers(PRODUCT_IDS_KEY(kind));
  if (ids.length === 0) return [];

  const records = await Promise.all(ids.map((id) => redis.get<SellerProductRecord>(PRODUCT_KEY(kind, id))));
  return records
    .filter((record): record is SellerProductRecord => Boolean(record))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSellerProduct(kind: SellerProductKind, id: string): Promise<SellerProductRecord | null> {
  const redis = getRedisClient();
  return (await redis.get<SellerProductRecord>(PRODUCT_KEY(kind, id))) ?? null;
}

export async function saveSellerProduct(
  kind: SellerProductKind,
  id: string,
  input: SellerProductInput,
): Promise<SellerProductRecord> {
  const redis = getRedisClient();
  const existing = await getSellerProduct(kind, id);
  const record: SellerProductRecord = {
    ...input,
    id,
    kind,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(PRODUCT_KEY(kind, id), record);
  await redis.sadd(PRODUCT_IDS_KEY(kind), id);
  return record;
}

export async function deleteSellerProduct(kind: SellerProductKind, id: string): Promise<void> {
  const redis = getRedisClient();
  const existing = await getSellerProduct(kind, id);
  await redis.del(PRODUCT_KEY(kind, id));
  await redis.srem(PRODUCT_IDS_KEY(kind), id);

  if (existing) {
    await Promise.all(
      existing.images
        .map((url) => url.match(/\/api\/seller\/images\/([^/?#]+)/)?.[1])
        .filter((imageId): imageId is string => Boolean(imageId))
        .map((imageId) => redis.del(IMAGE_KEY(imageId))),
    );
  }
}

export type StoredImage = { contentType: string; data: string };

const MAX_IMAGE_BYTES = 1_500_000;

/** Persists a "data:<type>;base64,<data>" URL and returns the public /api/seller/images/<id> URL to serve it at. */
export async function saveSellerImageFromDataUrl(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!match) throw new Error("Unsupported image format");

  const [, contentType, data] = match;
  if (Buffer.byteLength(data, "base64") > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large after compression — try a smaller photo");
  }

  const imageId = crypto.randomUUID();
  await getRedisClient().set<StoredImage>(IMAGE_KEY(imageId), { contentType, data });
  return `/api/seller/images/${imageId}`;
}

export async function getSellerImage(imageId: string): Promise<StoredImage | null> {
  return (await getRedisClient().get<StoredImage>(IMAGE_KEY(imageId))) ?? null;
}

/** Persists any not-yet-uploaded ("data:...") images and passes already-served URLs through unchanged. */
export async function resolveImagesForSave(images: string[]): Promise<string[]> {
  return Promise.all(images.map((image) => (image.startsWith("data:") ? saveSellerImageFromDataUrl(image) : image)));
}

/** Fixed taxonomy shared with the seller form's category/style selects, reusing the sample catalog's labels. */
export const SELLER_CATEGORY_OPTIONS = SAMPLE_CATEGORIES;
export const SELLER_STYLE_OPTIONS = SAMPLE_STYLE_TAGS;

function taxonomyTitle(slug: string | undefined, options: typeof SAMPLE_CATEGORIES) {
  if (!slug) return undefined;
  return options.find((option) => option.slug === slug) ?? { title: { en: slug }, slug };
}

/** Shapes a Redis-backed record into the same ProductDetail/PreorderProductDetail shape the storefront components expect. */
export function toProductDetail(record: SellerProductRecord): ProductDetail | PreorderProductDetail {
  const base = {
    _id: `seller.${record.kind}.${record.id}`,
    name: { en: record.name },
    slug: record.id,
    images: record.images,
    basePrice: record.basePrice,
    weightKg: record.weightKg,
    stockStatus: record.stockStatus,
    flags: record.flags,
    speciesTag: record.speciesTag,
    category: taxonomyTitle(record.category, SELLER_CATEGORY_OPTIONS) ?? null,
    styleTags: (record.styleTags ?? [])
      .map((slug) => taxonomyTitle(slug, SELLER_STYLE_OPTIONS))
      .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag)),
    description: record.description ? { en: record.description } : undefined,
  };

  if (record.kind === "preorder") {
    return {
      ...base,
      preorderStatus: record.preorderStatus,
      expectedShipWindowStart: record.expectedShipWindowStart,
      expectedShipWindowEnd: record.expectedShipWindowEnd,
    };
  }

  return base;
}
