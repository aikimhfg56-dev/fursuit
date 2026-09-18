import { currentUser } from "@clerk/nextjs/server";
import { getLocale, getTranslations } from "next-intl/server";
import ShippingGateSection from "@/components/account/ShippingGateSection";
import CheckoutPanel from "@/components/checkout/CheckoutPanel";
import type { PaymentMethodId } from "@/components/checkout/PaymentMethodSelector";
import FadeIn from "@/components/motion/FadeIn";
import type { Locale } from "@/i18n/routing";
import { getAccountProfile } from "@/lib/account/profile";
import { getShippingGateState } from "@/lib/account/shippingGate";
import { getPreferredCurrency } from "@/lib/currency/preference";
import { convertFromUsd, convertJpyToUsd } from "@/lib/currency/rates";
import {
  isClerkConfigured,
  isCoinbaseConfigured,
  isPaypalConfigured,
  isStripeConfigured,
  isWiseConfigured,
} from "@/lib/env";
import { pickLocaleValue } from "@/lib/i18n/pickLocaleValue";
import type { PreorderProductDetail, ProductDetail } from "@/lib/sanity/queries";
import { getEmsRateJpy, getEmsZoneForCountry } from "@/lib/shipping/emsRates";
import { getShippingRateUsd, getShippingRegionForLocale } from "@/lib/shipping/rates";
import PriceDisplay from "./PriceDisplay";
import ProductGallery from "./ProductGallery";

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
  const categoryName = product.category ? pickLocaleValue(product.category.title, locale) : undefined;
  const eyebrow = [categoryName, product.speciesTag].filter(Boolean).join(" · ");

  const badges: string[] = [];
  if (product.stockStatus === "sold_out") badges.push(t("stockStatus.sold_out"));
  else if (product.stockStatus === "low_stock") badges.push(t("stockStatus.low_stock"));
  for (const flag of product.flags ?? []) badges.push(t(`flags.${flag}`));

  const currency = await getPreferredCurrency(locale);
  const displayAmount = await convertFromUsd(product.basePrice, currency);

  const configuredMethods: PaymentMethodId[] = [
    ...(isStripeConfigured() ? (["card", "alipay"] as const) : []),
    ...(isPaypalConfigured() ? (["paypal"] as const) : []),
    ...(isWiseConfigured() ? (["wise"] as const) : []),
    ...(isCoinbaseConfigured() ? (["crypto"] as const) : []),
  ];

  // Purchases require an account; full name + address are collected lazily
  // here (not at sign-up) — see lib/account/shippingGate.ts.
  const user = isClerkConfigured() ? await currentUser() : null;
  const profile = user ? getAccountProfile(user) : {};
  const gateState = getShippingGateState(user?.id ?? null, profile);

  // Real EMS rate once the buyer's country + the product's shipping weight
  // are both known; otherwise fall back to the flat locale-region estimate.
  const emsZone = profile.address?.country ? getEmsZoneForCountry(profile.address.country) : null;
  const shippingUsd =
    emsZone && product.weightKg
      ? await convertJpyToUsd(getEmsRateJpy(emsZone, product.weightKg))
      : getShippingRateUsd(getShippingRegionForLocale(locale));

  const preorder = kind === "preorder" ? (product as PreorderProductDetail) : null;
  if (preorder?.preorderStatus) badges.push(t(`preorderStatus.${preorder.preorderStatus}`));
  const dateFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short" });
  const shipStart = preorder?.expectedShipWindowStart
    ? dateFormatter.format(new Date(preorder.expectedShipWindowStart))
    : null;
  const shipEnd = preorder?.expectedShipWindowEnd
    ? dateFormatter.format(new Date(preorder.expectedShipWindowEnd))
    : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-2 sm:items-start">
      <FadeIn onMount y={16} className="sm:sticky sm:top-8">
        <ProductGallery images={product.images ?? []} name={name} placeholderLabel={t("imageComingSoon")} />
      </FadeIn>

      <FadeIn onMount y={16} delay={0.12}>
        {eyebrow && <p className="text-xs font-medium uppercase tracking-wide text-black/45">{eyebrow}</p>}
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{name}</h1>
        <PriceDisplay basePriceUsd={product.basePrice} className="mt-2 block text-lg text-black/70" />

        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-black/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-black/60"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {description && <p className="mt-4 text-sm text-black/70">{description}</p>}

        {preorder && (shipStart || shipEnd) && (
          <p className="mt-4 rounded border border-black/10 px-3 py-2 text-xs text-black/60">
            {t("expectedShip", { range: `${shipStart ?? "?"} – ${shipEnd ?? "?"}` })}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {product.stockStatus === "sold_out" ? (
            <p className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60">
              {t("soldOutMessage")}
            </p>
          ) : (
            <>
              <ShippingGateSection
                state={gateState}
                returnPath={`/${kind}/${product.slug}`}
                signInDescription={tAccount("signInToPurchase")}
                profile={profile}
              />
              {gateState === "ready" && (
                <CheckoutPanel
                  productName={name}
                  productKind={kind}
                  productSlug={product.slug}
                  amountUsd={product.basePrice}
                  displayAmount={displayAmount}
                  shippingUsd={shippingUsd}
                  currency={currency}
                  configuredMethods={configuredMethods}
                />
              )}
            </>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
