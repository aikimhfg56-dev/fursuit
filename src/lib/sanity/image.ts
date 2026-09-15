import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import type { ProductImage } from "./queries";
import { getSanityClient } from "./client";

export function urlForImage(source: Image) {
  const client = getSanityClient();
  if (!client) return undefined;
  return imageUrlBuilder(client).image(source);
}

/** A plain string is already a servable URL (seller-uploaded image); otherwise resolve it as a Sanity asset. */
export function resolveProductImageUrl(image: ProductImage, size = 1200): string | undefined {
  if (typeof image === "string") return image;
  return urlForImage(image)?.width(size).height(size).fit("crop").url();
}
