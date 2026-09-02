import { isWiseConfigured } from "@/lib/env";

export type WiseBankDetails = {
  accountHolder: string;
  iban: string;
  bic: string;
  accountNumber?: string;
  sortCode?: string;
  bankCountry: string;
};

/**
 * Wise has no automated checkout here — receiving bank details are shown to
 * the shopper with a reference code, and payment is confirmed manually by
 * staff once it lands in the account (see order.paymentStatus =
 * "awaiting_bank_transfer" in the Sanity order schema).
 */
export function getWiseBankDetails(): WiseBankDetails | null {
  if (!isWiseConfigured()) return null;

  return {
    accountHolder: process.env.WISE_ACCOUNT_HOLDER!,
    iban: process.env.WISE_IBAN!,
    bic: process.env.WISE_BIC ?? "",
    accountNumber: process.env.WISE_ACCOUNT_NUMBER,
    sortCode: process.env.WISE_SORT_CODE,
    bankCountry: process.env.WISE_BANK_COUNTRY ?? "",
  };
}
