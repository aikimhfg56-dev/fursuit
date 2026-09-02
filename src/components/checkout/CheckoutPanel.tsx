"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import PaymentMethodSelector, { type PaymentMethodId } from "./PaymentMethodSelector";
import PromoCodeInput, { type PromoStatus } from "./PromoCodeInput";
import WiseBankTransferPanel from "./WiseBankTransferPanel";
import type { WiseBankDetails } from "@/lib/payments/wise";

type SupportedCurrency = "USD" | "GBP" | "EUR" | "AUD" | "JPY";

type CheckoutPanelProps = {
  productName: string;
  amountUsd: number;
  currency: SupportedCurrency;
  configuredMethods: PaymentMethodId[];
};

export default function CheckoutPanel({
  productName,
  amountUsd,
  currency,
  configuredMethods,
}: CheckoutPanelProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [method, setMethod] = useState<PaymentMethodId>(configuredMethods[0] ?? "card");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoStatus, setPromoStatus] = useState<PromoStatus>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wiseResult, setWiseResult] = useState<{
    referenceCode: string;
    bankDetails: WiseBankDetails | null;
  } | null>(null);

  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const totalUsd = Math.max(amountUsd - discountAmount, 0);

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
    setSubmitting(true);
    setErrorMessage(null);

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
            currency: currency.toLowerCase(),
            promoCode: appliedPromo?.code,
            paymentMethods,
            successUrl: `${window.location.origin}${window.location.pathname}?status=success`,
            cancelUrl: `${window.location.origin}${window.location.pathname}?status=cancelled`,
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
            currency,
            promoCode: appliedPromo?.code,
            returnUrl: `${window.location.origin}${window.location.pathname}?status=success`,
            cancelUrl: `${window.location.origin}${window.location.pathname}?status=cancelled`,
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
          body: JSON.stringify({ amountUsd, currency, promoCode: appliedPromo?.code }),
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
    <div className="space-y-6 rounded-xl border border-black/10 p-6 dark:border-white/10">
      <h2 className="text-lg font-semibold">{t("title")}</h2>

      <PaymentMethodSelector value={method} onChange={setMethod} configuredMethods={configuredMethods} />

      <PromoCodeInput
        code={promoInput}
        onCodeChange={setPromoInput}
        onApply={handleApplyPromo}
        status={promoStatus}
      />

      <dl className="space-y-1 border-t border-black/10 pt-4 text-sm dark:border-white/10">
        <div className="flex justify-between">
          <dt>{t("summary.subtotal")}</dt>
          <dd>{currencyFormatter.format(amountUsd)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <dt>{t("summary.discount")}</dt>
            <dd>-{currencyFormatter.format(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <dt>{t("summary.total")}</dt>
          <dd>{currencyFormatter.format(totalUsd)}</dd>
        </div>
      </dl>

      {method === "wise" && wiseResult && (
        <WiseBankTransferPanel bankDetails={wiseResult.bankDetails} referenceCode={wiseResult.referenceCode} />
      )}

      {errorMessage && <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={submitting || !configuredMethods.includes(method)}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
      >
        {t("payButton")}
      </button>
    </div>
  );
}
