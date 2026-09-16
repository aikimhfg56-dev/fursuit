import type { AccountAddress } from "@/lib/account/profile";
import { assignCustomerNumber } from "@/lib/customerNumber";
import { getRedisClient } from "@/lib/upstash";

export type OrderRecord = {
  id: string;
  /** Absent for orders placed before this field existed, or if Clerk wasn't configured at checkout time. */
  buyerUserId?: string;
  /** "RF-039", "RFS-001", etc. — assigned once, in purchase order, on creation (see assignCustomerNumber). */
  customerNumber?: string;
  productKind?: "shop" | "preorder";
  paymentMethod: string;
  paymentStatus: string;
  referenceCode: string;
  providerReference?: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  shippingAddress?: AccountAddress;
  createdAt: string;
};

const ORDER_KEY = (id: string) => `order:${id}`;
const ORDER_IDS_KEY = "orders";
const BUYER_ORDERS_KEY = (userId: string) => `buyer:${userId}:orders`;

/**
 * Sanity's order record needs a real Sanity project to exist at all — this
 * Redis-backed copy is what actually powers the seller admin's order list
 * and the buyer's own order history, since Sanity isn't (and may never be)
 * configured for this site.
 */
export async function recordOrder(input: Omit<OrderRecord, "id" | "createdAt" | "customerNumber">): Promise<OrderRecord> {
  const redis = getRedisClient();
  // Semi Order and Custom Commission purchases share the "order" sequence
  // (RF-xxx); Shop purchases get their own (RFS-xxx). Assigned here, at the
  // moment the order is actually recorded, so numbers land in purchase order.
  const customerNumber = input.productKind
    ? await assignCustomerNumber(input.productKind === "shop" ? "shop" : "order")
    : undefined;
  const record: OrderRecord = {
    ...input,
    customerNumber,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await redis.set(ORDER_KEY(record.id), record);
  await redis.sadd(ORDER_IDS_KEY, record.id);
  if (record.buyerUserId) {
    await redis.sadd(BUYER_ORDERS_KEY(record.buyerUserId), record.id);
  }
  return record;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const redis = getRedisClient();
  const ids = await redis.smembers(ORDER_IDS_KEY);
  if (ids.length === 0) return [];

  const records = await Promise.all(ids.map((id) => redis.get<OrderRecord>(ORDER_KEY(id))));
  return records
    .filter((record): record is OrderRecord => Boolean(record))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listOrdersForBuyer(userId: string): Promise<OrderRecord[]> {
  const redis = getRedisClient();
  const ids = await redis.smembers(BUYER_ORDERS_KEY(userId));
  if (ids.length === 0) return [];

  const records = await Promise.all(ids.map((id) => redis.get<OrderRecord>(ORDER_KEY(id))));
  return records
    .filter((record): record is OrderRecord => Boolean(record))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
