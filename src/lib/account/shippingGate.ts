import { hasShippingDetails, type AccountProfile } from "./profile";

export type ShippingGateState = "signed_out" | "needs_details" | "ready";

/**
 * Purchases (ready-made/pre-order checkout) and commission quotes require an
 * account, but full name + address are only collected the first time one of
 * those flows is reached — not at sign-up. Both call sites (ProductDetailView,
 * the commission quote page) branch their rendering on this same state.
 */
export function getShippingGateState(userId: string | null, profile: AccountProfile): ShippingGateState {
  if (!userId) return "signed_out";
  if (!hasShippingDetails(profile)) return "needs_details";
  return "ready";
}
