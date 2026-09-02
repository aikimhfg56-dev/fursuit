"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function BillingPortalButton() {
  const t = useTranslations("account.overview");
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const response = await fetch("/api/account/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-black/20 px-5 py-2.5 text-sm font-medium disabled:opacity-40 dark:border-white/20"
    >
      {loading ? t("billingLoading") : t("managePayment")}
    </button>
  );
}
