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

  const rows: [string, string][] = [
    [t("accountHolder"), bankDetails.accountHolder],
    ...(bankDetails.iban ? ([[t("iban"), bankDetails.iban]] as [string, string][]) : []),
    ...(bankDetails.routingNumber ? ([[t("routingNumber"), bankDetails.routingNumber]] as [string, string][]) : []),
    ...(bankDetails.accountNumber ? ([[t("accountNumber"), bankDetails.accountNumber]] as [string, string][]) : []),
    ...(bankDetails.sortCode ? ([[t("sortCode"), bankDetails.sortCode]] as [string, string][]) : []),
    ...(bankDetails.bic ? ([[t("bic"), bankDetails.bic]] as [string, string][]) : []),
    ...(bankDetails.bankAddress ? ([[t("bankAddress"), bankDetails.bankAddress]] as [string, string][]) : []),
    ...(bankDetails.bankCountry ? ([[t("bankCountry"), bankDetails.bankCountry]] as [string, string][]) : []),
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
