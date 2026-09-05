"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AccountAddress } from "@/lib/account/profile";
import ShippingDetailsForm from "./ShippingDetailsForm";

type ShippingDetailsSectionProps = {
  fullName?: string;
  address?: AccountAddress;
};

/**
 * Collapsed by default — shipping details aren't collected at sign-up
 * anymore, only lazily at checkout, so this section stays out of the way
 * on the account page unless the shopper wants to review or edit it ahead
 * of time.
 */
export default function ShippingDetailsSection({ fullName, address }: ShippingDetailsSectionProps) {
  const t = useTranslations("account.overview");
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const hasDetails = Boolean(fullName && address);

  function handleSaved() {
    setExpanded(false);
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-black/10 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t("shippingHeading")}</h2>
          <p className="mt-1 text-sm text-black/60">
            {hasDetails ? t("shippingSummaryNote") : t("shippingMissingNote")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 rounded-full border border-black/20 px-4 py-1.5 text-sm font-medium"
        >
          {expanded ? t("hide") : hasDetails ? t("edit") : t("add")}
        </button>
      </div>

      {!expanded && hasDetails && (
        <p className="mt-4 text-sm text-black/80">
          {fullName}
          <br />
          {[address?.line1, address?.line2, address?.city, address?.postalCode, address?.country]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}

      {expanded && (
        <div className="mt-4">
          <ShippingDetailsForm initialFullName={fullName} initialAddress={address} onSaved={handleSaved} />
        </div>
      )}
    </section>
  );
}
