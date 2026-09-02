import { defineField } from "sanity";

/**
 * Fields shared by readyMadeProduct and preorderProduct. Kept as one array
 * so the two document types can't drift apart on the base commerce shape.
 */
export const baseProductFields = [
  defineField({ name: "name", title: "Name", type: "localeString", validation: (rule) => rule.required() }),
  defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    options: { source: "name.en" },
    validation: (rule) => rule.required(),
  }),
  defineField({ name: "description", title: "Description", type: "localeText" }),
  defineField({
    name: "images",
    title: "Images",
    type: "array",
    of: [{ type: "image", options: { hotspot: true } }],
    validation: (rule) => rule.min(1),
  }),
  defineField({
    name: "basePrice",
    title: "Base price (USD)",
    description: "Source-of-truth price in USD. Converted to the shopper's display currency at request time.",
    type: "number",
    validation: (rule) => rule.required().positive(),
  }),
  defineField({ name: "sku", title: "SKU", type: "string" }),
  defineField({
    name: "stockStatus",
    title: "Stock status",
    type: "string",
    options: {
      list: [
        { title: "In stock", value: "in_stock" },
        { title: "Low stock", value: "low_stock" },
        { title: "Sold out", value: "sold_out" },
      ],
    },
    initialValue: "in_stock",
  }),
  defineField({ name: "category", title: "Category", type: "reference", to: [{ type: "category" }] }),
  defineField({
    name: "styleTags",
    title: "Style tags",
    type: "array",
    of: [{ type: "reference", to: [{ type: "styleTag" }] }],
  }),
  defineField({ name: "speciesTag", title: "Species", type: "string" }),
  defineField({
    name: "flags",
    title: "Flags",
    type: "array",
    of: [{ type: "string" }],
    options: {
      list: [
        { title: "New arrival", value: "new_arrival" },
        { title: "Flash sale", value: "flash_sale" },
        { title: "Clearance", value: "clearance" },
      ],
    },
  }),
  defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
];
