import { getRedisClient } from "@/lib/upstash";

/**
 * Two independent, atomically-incrementing customer number sequences:
 * "order" covers Semi Order + Custom Commission purchases together (they
 * share one sequence, per the seller's request), "shop" covers ready-made
 * Shop purchases on their own.
 */
export type CustomerNumberSeries = "order" | "shop";

const COUNTER_KEY: Record<CustomerNumberSeries, string> = {
  order: "counter:customerNumber:order",
  shop: "counter:customerNumber:shop",
};

const PREFIX: Record<CustomerNumberSeries, string> = {
  order: "RF",
  shop: "RFS",
};

// The first number ever assigned in each series — "order" continues on from
// pre-existing (pre-system) customers, "shop" starts fresh.
const STARTING_NUMBER: Record<CustomerNumberSeries, number> = {
  order: 39,
  shop: 1,
};

/** Assigns the next customer number in the given series, e.g. "RF-039" then "RF-040". */
export async function assignCustomerNumber(series: CustomerNumberSeries): Promise<string> {
  const redis = getRedisClient();
  const count = await redis.incr(COUNTER_KEY[series]);
  const number = count - 1 + STARTING_NUMBER[series];
  return `${PREFIX[series]}-${String(number).padStart(3, "0")}`;
}
