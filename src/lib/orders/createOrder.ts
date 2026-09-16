import type { AccountAddress } from "@/lib/account/profile";
import { recordOrder, type OrderRecord } from "@/lib/orders/store";
import { getSanityWriteClient } from "@/lib/sanity/client";

export type OrderInput = {
  buyerUserId?: string;
  /** Determines which customer-number sequence this order draws from — see lib/customerNumber.ts. */
  productKind?: "shop" | "preorder";
  paymentMethod:
    | "stripe_card"
    | "stripe_alipay"
    | "stripe_revolut_pay"
    | "paypal"
    | "wise"
    | "coinbase";
  paymentStatus: "pending" | "awaiting_bank_transfer" | "paid" | "failed" | "refunded";
  referenceCode: string;
  providerReference?: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  productName?: string;
  shippingAddress?: AccountAddress;
};

/**
 * Always records the order in Redis (what actually powers the seller
 * admin's order list), and additionally writes to Sanity if it's connected
 * — Sanity isn't required for checkout to complete or for the seller to see
 * the order. Returns the Redis record (including its assigned customer
 * number) so callers can pass it along — e.g. into the preorder chat thread.
 */
export async function createOrder(input: OrderInput): Promise<OrderRecord> {
  const record = await recordOrder(input);

  const client = getSanityWriteClient();
  if (client) {
    await client.create({
      _type: "order",
      shippingStatus: "not_shipped",
      createdAt: new Date().toISOString(),
      ...input,
    });
  }

  return record;
}
