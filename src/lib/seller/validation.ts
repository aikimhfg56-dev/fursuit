import type { ProductFlag, ProductStockStatus, PreorderStatus } from "@/lib/sanity/queries";
import type { SellerProductInput, SellerProductKind } from "./store";
import { SELLER_CATEGORY_OPTIONS, SELLER_STYLE_OPTIONS } from "./store";

const VALID_STOCK_STATUSES: ProductStockStatus[] = ["in_stock", "low_stock", "sold_out"];
const VALID_FLAGS: ProductFlag[] = ["new_arrival", "flash_sale", "clearance"];
const VALID_PREORDER_STATUSES: PreorderStatus[] = ["open", "closing_soon", "closed", "in_production"];

/** Lowercase letters, digits, and single hyphens between segments — matches how Sanity slugs already look (e.g. "sample-fox-fullsuit"). */
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type ValidatedProductPayload = { id: string; kind: SellerProductKind; input: SellerProductInput };
export type ValidationResult = { data: ValidatedProductPayload } | { error: string };

export function validateProductPayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) return { error: "invalid_body" };
  const b = body as Record<string, unknown>;

  const kind = b.kind;
  if (kind !== "shop" && kind !== "preorder") return { error: "invalid_kind" };

  const id = typeof b.id === "string" ? b.id.trim() : "";
  if (!SLUG_PATTERN.test(id)) return { error: "invalid_slug" };

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "missing_name" };

  const images = Array.isArray(b.images) ? b.images.filter((url): url is string => typeof url === "string") : [];
  if (images.length === 0) return { error: "missing_images" };

  const basePrice = typeof b.basePrice === "number" ? b.basePrice : Number(b.basePrice);
  if (!Number.isFinite(basePrice) || basePrice <= 0) return { error: "invalid_price" };

  const weightKgRaw = b.weightKg === "" || b.weightKg == null ? undefined : Number(b.weightKg);
  if (weightKgRaw !== undefined && (!Number.isFinite(weightKgRaw) || weightKgRaw <= 0)) {
    return { error: "invalid_weight" };
  }
  const weightKg = weightKgRaw;

  const stockStatus = VALID_STOCK_STATUSES.includes(b.stockStatus as ProductStockStatus)
    ? (b.stockStatus as ProductStockStatus)
    : "in_stock";

  const category =
    typeof b.category === "string" && SELLER_CATEGORY_OPTIONS.some((option) => option.slug === b.category)
      ? b.category
      : undefined;

  const styleTags = Array.isArray(b.styleTags)
    ? b.styleTags.filter(
        (slug): slug is string => typeof slug === "string" && SELLER_STYLE_OPTIONS.some((option) => option.slug === slug),
      )
    : [];

  const flags = Array.isArray(b.flags)
    ? (b.flags as unknown[]).filter((flag): flag is ProductFlag => VALID_FLAGS.includes(flag as ProductFlag))
    : [];

  const description = typeof b.description === "string" ? b.description.trim() || undefined : undefined;
  const speciesTag = typeof b.speciesTag === "string" ? b.speciesTag.trim() || undefined : undefined;

  const input: SellerProductInput = {
    name,
    description,
    images,
    basePrice,
    weightKg,
    stockStatus,
    category,
    speciesTag,
    styleTags,
    flags,
  };

  if (kind === "preorder") {
    input.preorderStatus = VALID_PREORDER_STATUSES.includes(b.preorderStatus as PreorderStatus)
      ? (b.preorderStatus as PreorderStatus)
      : "open";
    input.expectedShipWindowStart = typeof b.expectedShipWindowStart === "string" ? b.expectedShipWindowStart : undefined;
    input.expectedShipWindowEnd = typeof b.expectedShipWindowEnd === "string" ? b.expectedShipWindowEnd : undefined;
  }

  return { data: { id, kind, input } };
}
