import { createClient, type SanityClient } from "@sanity/client";
import { isSanityConfigured } from "@/lib/env";

let cachedClient: SanityClient | null = null;
let cachedWriteClient: SanityClient | null = null;

/**
 * Returns null until NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET are set, so
 * callers (product queries, promo code lookups) can render a
 * "catalog not connected yet" state instead of crashing.
 */
export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;

  if (!cachedClient) {
    cachedClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: "2025-01-01",
      useCdn: true,
      token: process.env.SANITY_API_TOKEN,
    });
  }

  return cachedClient;
}

/**
 * Server-only client for writing order records (webhooks, payment capture
 * routes). Needs SANITY_API_TOKEN with write access in addition to the
 * project ID/dataset; returns null until both are set.
 */
export function getSanityWriteClient(): SanityClient | null {
  if (!isSanityConfigured() || !process.env.SANITY_API_TOKEN) return null;

  if (!cachedWriteClient) {
    cachedWriteClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
      apiVersion: "2025-01-01",
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    });
  }

  return cachedWriteClient;
}
