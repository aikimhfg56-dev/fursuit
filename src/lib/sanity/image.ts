import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { getSanityClient } from "./client";

export function urlForImage(source: Image) {
  const client = getSanityClient();
  if (!client) return undefined;
  return imageUrlBuilder(client).image(source);
}
