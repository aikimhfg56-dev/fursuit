import type { PreorderProductSummary, ProductSummary, TaxonomyTerm } from "./queries";

/**
 * Placeholder catalog shown on the shop and preorder pages while Sanity isn't
 * connected yet, so the grid layout can be previewed before real products
 * exist. Once isSanityConfigured() is true, the real Sanity fetch takes over
 * and this data is never rendered.
 */
export const SAMPLE_CATEGORIES: TaxonomyTerm[] = [
  { title: { en: "Full Suit", ja: "フルスーツ", de: "Ganzanzug", fr: "Costume complet", es: "Traje completo" }, slug: "full-suit" },
  { title: { en: "Partial Suit", ja: "パーシャルスーツ", de: "Teilanzug", fr: "Costume partiel", es: "Traje parcial" }, slug: "partial-suit" },
  { title: { en: "Hands", ja: "手", de: "Hände", fr: "Mains", es: "Manos" }, slug: "hands" },
  { title: { en: "Feet", ja: "足", de: "Füße", fr: "Pieds", es: "Pies" }, slug: "feet" },
  { title: { en: "Tail", ja: "尻尾", de: "Schwanz", fr: "Queue", es: "Cola" }, slug: "tail" },
  { title: { en: "Other", ja: "その他", de: "Sonstiges", fr: "Autre", es: "Otro" }, slug: "other" },
];

export const SAMPLE_STYLE_TAGS: TaxonomyTerm[] = [];

function category(slug: string): TaxonomyTerm {
  return SAMPLE_CATEGORIES.find((c) => c.slug === slug)!;
}

export const SAMPLE_READY_MADE_PRODUCTS: ProductSummary[] = [
  {
    _id: "sample.crimson-fox-fullsuit",
    name: { en: "Crimson Fox Fullsuit" },
    slug: "crimson-fox-fullsuit",
    images: [],
    basePrice: 1200,
    weightKg: 3.5,
    stockStatus: "in_stock",
    flags: ["new_arrival"],
    speciesTag: "Fox",
    category: category("full-suit"),
  },
  {
    _id: "sample.arctic-wolf-head",
    name: { en: "Arctic Wolf Head" },
    slug: "arctic-wolf-head",
    images: [],
    basePrice: 650,
    weightKg: 1.2,
    stockStatus: "in_stock",
    speciesTag: "Wolf",
    category: category("partial-suit"),
  },
  {
    _id: "sample.honey-bear-paws",
    name: { en: "Honey Bear Paws" },
    slug: "honey-bear-paws",
    images: [],
    basePrice: 180,
    weightKg: 0.3,
    stockStatus: "in_stock",
    speciesTag: "Bear",
    category: category("hands"),
  },
  {
    _id: "sample.midnight-raven-fullsuit",
    name: { en: "Midnight Raven Fullsuit" },
    slug: "midnight-raven-fullsuit",
    images: [],
    basePrice: 1350,
    weightKg: 3.5,
    stockStatus: "low_stock",
    speciesTag: "Raven",
    category: category("full-suit"),
  },
  {
    _id: "sample.speckled-deer-ears",
    name: { en: "Speckled Deer Ears" },
    slug: "speckled-deer-ears",
    images: [],
    basePrice: 90,
    weightKg: 0.15,
    stockStatus: "in_stock",
    speciesTag: "Deer",
    category: category("other"),
  },
  {
    _id: "sample.sable-otter-tail",
    name: { en: "Sable Otter Tail" },
    slug: "sable-otter-tail",
    images: [],
    basePrice: 120,
    weightKg: 0.25,
    stockStatus: "in_stock",
    speciesTag: "Otter",
    category: category("tail"),
  },
  {
    _id: "sample.golden-retriever-fullsuit",
    name: { en: "Golden Retriever Fullsuit" },
    slug: "golden-retriever-fullsuit",
    images: [],
    basePrice: 1400,
    weightKg: 3.5,
    stockStatus: "sold_out",
    speciesTag: "Dog",
    category: category("full-suit"),
  },
  {
    _id: "sample.amber-dragon-head",
    name: { en: "Amber Dragon Head" },
    slug: "amber-dragon-head",
    images: [],
    basePrice: 900,
    weightKg: 1.2,
    stockStatus: "in_stock",
    flags: ["flash_sale"],
    speciesTag: "Dragon",
    category: category("partial-suit"),
  },
];

function monthsFromNow(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

export const SAMPLE_PREORDER_PRODUCTS: PreorderProductSummary[] = [
  {
    _id: "sample.silver-husky-fullsuit",
    name: { en: "Silver Husky Fullsuit" },
    slug: "silver-husky-fullsuit",
    images: [],
    basePrice: 1300,
    weightKg: 3.5,
    stockStatus: "in_stock",
    speciesTag: "Husky",
    category: category("full-suit"),
    preorderStatus: "open",
    expectedShipWindowStart: monthsFromNow(3),
    expectedShipWindowEnd: monthsFromNow(5),
  },
  {
    _id: "sample.copper-fennec-fox-head",
    name: { en: "Copper Fennec Fox Head" },
    slug: "copper-fennec-fox-head",
    images: [],
    basePrice: 700,
    weightKg: 1.2,
    stockStatus: "in_stock",
    speciesTag: "Fennec Fox",
    category: category("partial-suit"),
    preorderStatus: "open",
    expectedShipWindowStart: monthsFromNow(2),
    expectedShipWindowEnd: monthsFromNow(4),
  },
  {
    _id: "sample.moonlit-owl-fullsuit",
    name: { en: "Moonlit Owl Fullsuit" },
    slug: "moonlit-owl-fullsuit",
    images: [],
    basePrice: 1500,
    weightKg: 3.5,
    stockStatus: "in_stock",
    speciesTag: "Owl",
    category: category("full-suit"),
    preorderStatus: "closing_soon",
    expectedShipWindowStart: monthsFromNow(4),
    expectedShipWindowEnd: monthsFromNow(6),
  },
  {
    _id: "sample.frost-lynx-paws",
    name: { en: "Frost Lynx Paws" },
    slug: "frost-lynx-paws",
    images: [],
    basePrice: 200,
    weightKg: 0.4,
    stockStatus: "in_stock",
    speciesTag: "Lynx",
    category: category("feet"),
    preorderStatus: "open",
    expectedShipWindowStart: monthsFromNow(2),
    expectedShipWindowEnd: monthsFromNow(3),
  },
  {
    _id: "sample.ember-dragon-tail",
    name: { en: "Ember Dragon Tail" },
    slug: "ember-dragon-tail",
    images: [],
    basePrice: 150,
    weightKg: 0.25,
    stockStatus: "in_stock",
    speciesTag: "Dragon",
    category: category("tail"),
    preorderStatus: "in_production",
    expectedShipWindowStart: monthsFromNow(1),
    expectedShipWindowEnd: monthsFromNow(2),
  },
  {
    _id: "sample.storm-panther-fullsuit",
    name: { en: "Storm Panther Fullsuit" },
    slug: "storm-panther-fullsuit",
    images: [],
    basePrice: 1450,
    weightKg: 3.5,
    stockStatus: "in_stock",
    speciesTag: "Panther",
    category: category("full-suit"),
    preorderStatus: "closed",
    expectedShipWindowStart: monthsFromNow(3),
    expectedShipWindowEnd: monthsFromNow(5),
  },
];
