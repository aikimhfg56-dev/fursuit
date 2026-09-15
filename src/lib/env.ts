/**
 * Central "is this external service configured yet" checks. Every
 * integration (Sanity, Stripe, PayPal, Resend, Wise) is wired up in code
 * ahead of the user having real accounts/API keys, so every call site that
 * talks to one of these services must check the matching guard first and
 * fall back to a "not configured yet" UI state instead of throwing.
 */

export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET);
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isPaypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function isWiseConfigured(): boolean {
  // IBAN-style (EU) and routing/account-number-style (US, UK, etc.) accounts are both valid — only one need be set.
  return Boolean(process.env.WISE_ACCOUNT_HOLDER && (process.env.WISE_IBAN || process.env.WISE_ACCOUNT_NUMBER));
}

export function isCoinbaseConfigured(): boolean {
  return Boolean(process.env.COINBASE_COMMERCE_API_KEY);
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isFxRatesConfigured(): boolean {
  return Boolean(process.env.EXCHANGE_RATE_API_KEY);
}

/** Also read directly (not through this function) in proxy.ts, since middleware needs it at module-eval time. */
export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);
}

/** Backs both the rate limiter and the seller product store (lib/seller/store.ts). */
export function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** Without this, public API routes fall back to a per-process in-memory rate limiter (see lib/rateLimit.ts). */
export function isRateLimitConfigured(): boolean {
  return isUpstashConfigured();
}

/** The seller admin (/seller) needs a passphrase set — see .env.local.example. */
export function isSellerAuthConfigured(): boolean {
  return Boolean(process.env.SELLER_ACCESS_CODE);
}
