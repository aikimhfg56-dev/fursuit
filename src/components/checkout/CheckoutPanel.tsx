"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { SupportedCurrency } from "@/lib/currency/constants";
import PaymentMethodSelector, { type PaymentMethodId } from "./PaymentMethodSelector";
import PromoCodeInput, { type PromoStatus } from "./PromoCodeInput";
import WiseBankTransferPanel from "./WiseBankTransferPanel";
import type { WiseBankDetails } from "@/lib/payments/wise";

type CheckoutPanelProps = {
  productName: string;
  /** Base product price in USD — sent to the checkout APIs, which re-validate any promo and convert currency server-side. */
  amountUsd: number;
  /** Same price already converted to `currency`, for on-screen display only. */
  displayAmount: number;
  /** Flat shipping fee in USD for the shopper's region (see lib/shipping/rates.ts). */
  shippingUsd: number;
  currency: SupportedCurrency;
  configuredMethods: PaymentMethodId[];
};

export default function CheckoutPanel({
  productName,
  amountUsd,
  displayAmount,
  shippingUsd,
  currency,
  configuredMethods,
}: CheckoutPanelProps) {
  const t = useTranslations("checkout");
  const tLegal = useTranslations("legal");
  const locale = useLocale();
  const [method, setMethod] = useState<PaymentMethodId>(configuredMethods[0] ?? "card");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoStatus, setPromoStatus] = useState<PromoStatus>("idle");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wiseResult, setWiseResult] = useState<{
    referenceCode: string;
    bankDetails: WiseBankDetails | null;
  } | null>(null);

  // displayAmount is amountUsd already converted to `currency`; reuse that
  // ratio so the discount/shipping lines convert consistently without a
  // second client-side rate fetch.
  const conversionRate = amountUsd > 0 ? displayAmount / amountUsd : 1;
  const discountAmountUsd = appliedPromo?.discountAmount ?? 0;
  const discountDisplay = discountAmountUsd * conversionRate;
  const shippingDisplay = shippingUsd * conversionRate;
  const totalDisplay = Math.max(displayAmount - discountDisplay, 0) + shippingDisplay;

  async function handleApplyPromo() {
    if (!promoInput) return;
    setPromoStatus("checking");

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, orderAmountUsd: amountUsd }),
      });
      const data = await response.json();

      if (data.valid) {
        setAppliedPromo({ code: promoInput, discountAmount: data.discountAmount });
        setPromoStatus("applied");
      } else {
        setAppliedPromo(null);
        setPromoStatus(
          data.reason === "expired" ? "expired" : data.reason === "below_minimum" ? "belowMinimum" : "invalid",
        );
      }
    } catch {
      setAppliedPromo(null);
      setPromoStatus("invalid");
    }
  }

  async function handlePay() {
    if (!agreedToTerms) return;

    setSubmitting(true);
    setErrorMessage(null);

    const origin = window.location.origin;
    const successUrl = `${origin}/${locale}/checkout/success`;
    const cancelUrl = `${origin}${window.location.pathname}?status=cancelled`;

    try {
      if (method === "card" || method === "alipay" || method === "revolutPay") {
        const paymentMethods =
          method === "card" ? ["card"] : method === "alipay" ? ["alipay"] : ["revolut_pay"];

        const response = await fetch("/api/checkout/stripe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName,
            amountUsd,
            shippingUsd,
            currency: currency.toLowerCase(),
            promoCode: appliedPromo?.code,
            paymentMethods,
            // Stripe substitutes this literal placeholder with the real session id.
            successUrl: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl,
          }),
        });
        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          setErrorMessage(t("errors.generic"));
        }
      } else if (method === "paypal") {
        const response = await fetch("/api/checkout/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountUsd,
            shippingUsd,
            currency,
            promoCode: appliedPromo?.code,
            returnUrl: successUrl,
            cancelUrl,
          }),
        });
        const data = await response.json();

        if (data.approveUrl) {
          window.location.href = data.approveUrl;
        } else {
          setErrorMessage(t("errors.generic"));
        }
      } else if (method === "wise") {
        const response = await fetch("/api/checkout/wise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountUsd, shippingUsd, currency, promoCode: appliedPromo?.code }),
        });
        const data = await response.json();

        if (data.referenceCode) {
          setWiseResult({ referenceCode: data.referenceCode, bankDetails: data.bankDetails });
        } else {
          setErrorMessage(t("errors.generic"));
        }
      }
    } catch {
      setErrorMessage(t("errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  const currencyFormatter = new Intl.NumberFormat(locale, { style: "currency", currency });

  return (
    <div className="space-y-6 rounded-xl border border-black/10 p-6">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <PaymentMethodSelector value={method} onChange={setMethod} configuredMethods={configuredMethods} />

      <PromoCodeInput
        code={promoInput}
        onCodeChange={setPromoInput}
        onApply={handleApplyPromo}
        status={promoStatus}
      />

      <dl className="space-y-1 border-t border-black/10 pt-4 text-sm">
        <div className="flex justify-between">
          <dt>{t("summary.subtotal")}</dt>
          <dd>{currencyFormatter.format(displayAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t("summary.shipping")}</dt>
          <dd>{currencyFormatter.format(shippingDisplay)}</dd>
        </div>
        {discountDisplay > 0 && (
          <div className="flex justify-between text-green-600">
            <dt>{t("summary.discount")}</dt>
            <dd>-{currencyFormatter.format(discountDisplay)}</dd>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <dt>{t("summary.total")}</dt>
          <dd>{currencyFormatter.format(totalDisplay)}</dd>
        </div>
      </dl>

      {method === "wise" && wiseResult && (
        <WiseBankTransferPanel bankDetails={wiseResult.bankDetails} referenceCode={wiseResult.referenceCode} />
      )}

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(event) => setAgreedToTerms(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {tLegal.rich("termsAgreementLabel", {
            termsLink: (chunks) => (
              <Link href="/legal/terms" target="_blank" className="underline">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={submitting || !agreedToTerms || !configuredMethods.includes(method)}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
      >
        {t("payButton")}
      </button>
    </div>
  );
}
