export const COMMISSION_STARTING_PRICES = [
  { key: "fullSuit", usd: 5800 },
  { key: "head", usd: 2000 },
  { key: "bodysuit", usd: 2000 },
  { key: "hands", usd: 400 },
  { key: "feet", usd: 600 },
  { key: "tail", usd: 200 },
] as const;

export type CommissionStartingPriceKey = (typeof COMMISSION_STARTING_PRICES)[number]["key"];
