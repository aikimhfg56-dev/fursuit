"use client";

import { useTranslations } from "next-intl";
import type { WiseBankDetails } from "@/lib/payments/wise";

type WiseBankTransferPanelProps = {
  bankDetails: WiseBankDetails | null;
  referenceCode?: string;
};

export default function WiseBankTransferPanel({
  bankDetails,
  referenceCode,
}: WiseBankTransferPanelProps) {
  const t = useTranslations("checkout.wise");

  if (!bankDetails) {
    return (
      <p className="rounded border border-dashed border-black/20 px-4 py-3 text-sm text-black/60">
        {t("notConfigured")}
      </p>
    );
  }

  const rows: [string, string | undefined][] = [
    [t("accountHolder"), bankDetails.accountHolder],
    [t("iban"), bankDetails.iban],
    [t("bic"), bankDetails.bic],
    ...(referenceCode ? ([[t("reference"), referenceCode]] as [string, string][]) : []),
  ];

  return (
    <div className="rounded border border-black/15 px-4 py-3 text-sm">
      <p className="text-black/70">{t("instructions")}</p>
      <dl className="mt-3 space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-black/60">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
