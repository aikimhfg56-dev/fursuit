import { fetchPromoCode, type PromoCode } from "@/lib/sanity/queries";

export type PromoValidationResult =
  | { valid: true; promoCode: PromoCode; discountAmount: number; amountAfterDiscount: number }
  | { valid: false; reason: "not_found" | "expired" | "below_minimum" | "catalog_not_connected" };

/**
 * Provider-agnostic promo code check: the discount computed here is applied
 * to the order total before it's handed to Stripe, PayPal, or shown on the
 * Wise bank-transfer instructions, so all three payment paths see the same
 * discounted amount.
 */
export async function validatePromoCode(
  code: string,
  orderAmountUsd: number,
): Promise<PromoValidationResult> {
  const promoCode = await fetchPromoCode(code);

  if (!promoCode) {
    // Either Sanity isn't connected yet, or there's genuinely no such code —
    // both surface the same "not found" message to the shopper.
    return { valid: false, reason: "not_found" };
  }

  if (promoCode.expiresAt && new Date(promoCode.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  if (promoCode.minOrderAmount && orderAmountUsd < promoCode.minOrderAmount) {
    return { valid: false, reason: "below_minimum" };
  }

  const discountAmount =
    promoCode.discountType === "percentage"
      ? (orderAmountUsd * promoCode.discountValue) / 100
      : Math.min(promoCode.discountValue, orderAmountUsd);

  return {
    valid: true,
    promoCode,
    discountAmount,
    amountAfterDiscount: Math.max(orderAmountUsd - discountAmount, 0),
  };
}
