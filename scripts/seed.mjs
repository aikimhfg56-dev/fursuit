// One-off script to populate a few categories, style tags, and a sample
// product once Sanity is connected, so the shop/preorder pages have
// something to render while a real catalog is built out in Studio.
// Usage: npm run seed  (reads NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET and
// SANITY_API_TOKEN from .env.local)

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local — " +
      "set up your Sanity project first (see .env.local.example).",
  );
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-01-01", useCdn: false });

const categories = [
  { id: "head", en: "Head" },
  { id: "paws", en: "Paws" },
  { id: "outfits", en: "Outfits" },
  { id: "ears", en: "Ears" },
  { id: "tails", en: "Tails" },
  { id: "other", en: "Other" },
];

const styleTags = [
  { id: "kig", en: "Kig" },
  { id: "kemono", en: "Kemono" },
  { id: "toony", en: "Toony" },
  { id: "realistic", en: "Realistic" },
  { id: "cosplay", en: "Cosplay" },
];

async function run() {
  console.log("Seeding categories...");
  for (const category of categories) {
    await client.createOrReplace({
      _id: `category.${category.id}`,
      _type: "category",
      title: { en: category.en },
      slug: { _type: "slug", current: category.id },
    });
  }

  console.log("Seeding style tags...");
  for (const style of styleTags) {
    await client.createOrReplace({
      _id: `styleTag.${style.id}`,
      _type: "styleTag",
      title: { en: style.en },
      slug: { _type: "slug", current: style.id },
    });
  }

  console.log("Seeding a sample ready-made product...");
  const sampleReadyMade = await client.createOrReplace({
    _id: "readyMadeProduct.sample-fox",
    _type: "readyMadeProduct",
    name: { en: "Sample Fox Fullsuit" },
    slug: { _type: "slug", current: "sample-fox-fullsuit" },
    description: { en: "A sample fox fursuit, seeded for local testing." },
    basePrice: 1200,
    stockStatus: "in_stock",
    category: { _type: "reference", _ref: "category.head" },
    styleTags: [{ _type: "reference", _ref: "styleTag.toony", _key: "toony" }],
    speciesTag: "fox",
    flags: ["new_arrival"],
    featured: true,
    publishedAt: new Date().toISOString(),
  });

  console.log("Seeding a sample pre-order product...");
  const sampleThreeMonths = new Date();
  sampleThreeMonths.setMonth(sampleThreeMonths.getMonth() + 3);
  const sampleFiveMonths = new Date();
  sampleFiveMonths.setMonth(sampleFiveMonths.getMonth() + 5);

  const samplePreorder = await client.createOrReplace({
    _id: "preorderProduct.sample-wolf",
    _type: "preorderProduct",
    name: { en: "Sample Wolf Fullsuit (Pre-Order)" },
    slug: { _type: "slug", current: "sample-wolf-preorder" },
    description: { en: "A sample pre-order fursuit, seeded for local testing." },
    basePrice: 1450,
    stockStatus: "in_stock",
    category: { _type: "reference", _ref: "category.head" },
    styleTags: [{ _type: "reference", _ref: "styleTag.kemono", _key: "kemono" }],
    speciesTag: "wolf",
    preorderStatus: "open",
    expectedShipWindowStart: sampleThreeMonths.toISOString().slice(0, 10),
    expectedShipWindowEnd: sampleFiveMonths.toISOString().slice(0, 10),
    publishedAt: new Date().toISOString(),
  });

  console.log("Done. Created:", sampleReadyMade._id, "and", samplePreorder._id);
  console.log("Note: seeded products have no images yet — add one in Sanity Studio for each.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
