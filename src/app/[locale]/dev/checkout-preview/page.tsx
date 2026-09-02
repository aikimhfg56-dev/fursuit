import { isPaypalConfigured, isStripeConfigured, isWiseConfigured } from "@/lib/env";
import CheckoutPanel from "@/components/checkout/CheckoutPanel";
import type { PaymentMethodId } from "@/components/checkout/PaymentMethodSelector";

/**
 * Internal-only route to verify the payment method/promo code "frame" while
 * Sanity/Stripe/PayPal/Wise credentials are still pending and there's no
 * real product catalog yet (Milestone 3). Not linked from navigation — drop
 * once real product detail pages exist and embed CheckoutPanel there
 * instead.
 */
export default function CheckoutPreviewPage() {
  const configuredMethods: PaymentMethodId[] = [
    ...(isStripeConfigured() ? (["card", "alipay", "revolutPay"] as const) : []),
    ...(isPaypalConfigured() ? (["paypal"] as const) : []),
    ...(isWiseConfigured() ? (["wise"] as const) : []),
  ];

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <p className="mb-6 rounded border border-dashed border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
        Internal preview — not part of the public site. Verifies the payment
        method / promo code UI ahead of a real product catalog.
      </p>
      <CheckoutPanel
        productName="Sample Fox Fullsuit"
        amountUsd={1200}
        currency="USD"
        configuredMethods={configuredMethods}
      />
    </div>
  );
}
