import type { AccountAddress } from "@/lib/account/profile";
import { getSanityWriteClient } from "@/lib/sanity/client";

export type OrderInput = {
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
  shippingAddress?: AccountAddress;
};

/**
 * Writes an order record if Sanity is connected; otherwise just logs, so
 * checkout still completes for the shopper while CMS setup is pending.
 */
export async function createOrder(input: OrderInput): Promise<void> {
  const client = getSanityWriteClient();

  if (!client) {
    console.warn("[order] Sanity not configured yet, order not persisted:", input);
    return;
  }

  await client.create({
    _type: "order",
    shippingStatus: "not_shipped",
    createdAt: new Date().toISOString(),
    ...input,
  });
}
