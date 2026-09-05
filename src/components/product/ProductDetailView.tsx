import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import ShippingGateSection from "@/components/account/ShippingGateSection";
import CheckoutPanel from "@/components/checkout/CheckoutPanel";
import type { PaymentMethodId } from "@/components/checkout/PaymentMethodSelector";
import type { Locale } from "@/i18n/routing";
import { getAccountProfile } from "@/lib/account/profile";
import { getShippingGateState } from "@/lib/account/shippingGate";
import { getPreferredCurrency } from "@/lib/currency/preference";
import { convertFromUsd } from "@/lib/currency/rates";
import { isClerkConfigured, isPaypalConfigured, isStripeConfigured, isWiseConfigured } from "@/lib/env";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import { isRevolutPayEligible } from "@/lib/payments/stripe";
import { urlForImage } from "@/lib/sanity/image";
import type { PreorderProductDetail, ProductDetail } from "@/lib/sanity/queries";
import { getShippingRateUsd, getShippingRegionForCurrency } from "@/lib/shipping/rates";
import PriceDisplay from "./PriceDisplay";

type ProductDetailViewProps = {
  product: ProductDetail | PreorderProductDetail;
  kind: "shop" | "preorder";
};

export default async function ProductDetailView({ product, kind }: ProductDetailViewProps) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("product");
  const tAccount = await getTranslations("account");

  const name = pickLocaleValue(product.name, locale);
  const description = pickLocaleValue(product.description, locale);
  const imageUrl = product.images?.[0]
    ? urlForImage(product.images[0])?.width(1200).height(1200).fit("crop").url()
    : undefined;

  const currency = await getPreferredCurrency(locale);
  const displayAmount = await convertFromUsd(product.basePrice, currency);
  const shippingUsd = getShippingRateUsd(getShippingRegionForCurrency(currency));

  // Revolut Pay is presentment-currency-restricted at Stripe (GBP/EUR only) —
  // hiding it otherwise avoids offering a method that would fail at checkout.
  const configuredMethods: PaymentMethodId[] = [
    ...(isStripeConfigured() ? (["card", "alipay"] as const) : []),
    ...(isStripeConfigured() && isRevolutPayEligible(currency) ? (["revolutPay"] as const) : []),
    ...(isPaypalConfigured() ? (["paypal"] as const) : []),
    ...(isWiseConfigured() ? (["wise"] as const) : []),
  ];

  // Purchases require an account; full name + address are collected lazily
  // here (not at sign-up) — see lib/account/shippingGate.ts.
  const user = isClerkConfigured() ? await currentUser() : null;
  const profile = user ? getAccountProfile(user) : {};
  const gateState = getShippingGateState(user?.id ?? null, profile);

  const preorder = kind === "preorder" ? (product as PreorderProductDetail) : null;
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short" });
  const shipStart = preorder?.expectedShipWindowStart
    ? dateFormatter.format(new Date(preorder.expectedShipWindowStart))
    : null;
  const shipEnd = preorder?.expectedShipWindowEnd
    ? dateFormatter.format(new Date(preorder.expectedShipWindowEnd))
    : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-black/5">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={1200} height={1200} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        <PriceDisplay
          basePriceUsd={product.basePrice}
          className="mt-2 block text-lg text-black/70"
        />
        {description && <p className="mt-4 text-sm text-black/70">{description}</p>}

        {preorder && (shipStart || shipEnd) && (
          <p className="mt-4 rounded border border-black/10 px-3 py-2 text-xs text-black/60">
            {t("expectedShip", { range: `${shipStart ?? "?"} – ${shipEnd ?? "?"}` })}
          </p>
        )}

        <div className="mt-8 space-y-4">
          <ShippingGateSection
            state={gateState}
            returnPath={`/${kind}/${product.slug}`}
            signInDescription={tAccount("signInToPurchase")}
            profile={profile}
          />
          {gateState === "ready" && (
            <CheckoutPanel
              productName={name}
              amountUsd={product.basePrice}
              displayAmount={displayAmount}
              shippingUsd={shippingUsd}
              currency={currency}
              configuredMethods={configuredMethods}
            />
          )}
        </div>
      </div>
    </div>
  );
}
