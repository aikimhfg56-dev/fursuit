"use client";

import { useTranslations } from "next-intl";

export type PromoStatus = "idle" | "checking" | "applied" | "invalid" | "expired" | "belowMinimum";

type PromoCodeInputProps = {
  code: string;
  onCodeChange: (code: string) => void;
  onApply: () => void;
  status: PromoStatus;
  disabled?: boolean;
};

export default function PromoCodeInput({
  code,
  onCodeChange,
  onApply,
  status,
  disabled,
}: PromoCodeInputProps) {
  const t = useTranslations("checkout.promo");

  const statusMessage =
    status === "applied"
      ? t("applied")
      : status === "invalid"
        ? t("invalid")
        : status === "expired"
          ? t("expired")
          : status === "belowMinimum"
            ? t("belowMinimum")
            : null;

  return (
    <div>
      <label htmlFor="promo-code" className="block text-sm font-medium">
        {t("label")}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder={t("placeholder")}
          disabled={disabled}
          className="w-full rounded border border-black/15 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={disabled || status === "checking" || !code}
          className="shrink-0 rounded border border-black/20 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          {t("apply")}
        </button>
      </div>
      {statusMessage && (
        <p
          className={`mt-2 text-sm ${status === "applied" ? "text-green-600" : "text-red-600"}`}
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
}
