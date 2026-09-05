"use client";

import { useTranslations } from "next-intl";

export type PaymentMethodId = "card" | "paypal" | "alipay" | "revolutPay" | "wise";

export const ALL_PAYMENT_METHODS: PaymentMethodId[] = ["card", "paypal", "alipay", "revolutPay", "wise"];

type PaymentMethodSelectorProps = {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
  /** Methods whose backing service is actually configured; others render disabled. */
  configuredMethods: PaymentMethodId[];
};

export default function PaymentMethodSelector({
  value,
  onChange,
  configuredMethods,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("checkout");

  return (
    <fieldset>
      <legend className="text-sm font-medium">{t("paymentMethod")}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ALL_PAYMENT_METHODS.map((method) => {
          const isConfigured = configuredMethods.includes(method);
          const isSelected = value === method;

          return (
            <button
              key={method}
              type="button"
              disabled={!isConfigured}
              onClick={() => onChange(method)}
              title={isConfigured ? undefined : t("notConfigured")}
              className={`rounded border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-black/15"
              }`}
            >
              {t(`methods.${method}`)}
              {!isConfigured && (
                <span className="mt-0.5 block text-xs opacity-70">{t("notConfigured")}</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
