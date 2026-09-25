import type { TaxonomyTerm } from "./queries";

/**
 * Category/style taxonomy shown in the shop and preorder filters, and in the
 * seller admin's product form — used whenever Sanity isn't connected, since
 * there's no CMS to fetch these from otherwise.
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
