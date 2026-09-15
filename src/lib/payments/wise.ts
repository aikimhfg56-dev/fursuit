import { isWiseConfigured } from "@/lib/env";

export type WiseBankDetails = {
  accountHolder: string;
  /** EU-style accounts. */
  iban?: string;
  /** US/UK/etc-style accounts — account number paired with a routing number (US) or sort code (UK). */
  accountNumber?: string;
  routingNumber?: string;
  sortCode?: string;
  bic?: string;
  /** Needed for SWIFT wires on US-style accounts (Wise shows this alongside the routing/account number). */
  bankAddress?: string;
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
    iban: process.env.WISE_IBAN || undefined,
    accountNumber: process.env.WISE_ACCOUNT_NUMBER || undefined,
    routingNumber: process.env.WISE_ROUTING_NUMBER || undefined,
    sortCode: process.env.WISE_SORT_CODE || undefined,
    bic: process.env.WISE_BIC || undefined,
    bankAddress: process.env.WISE_BANK_ADDRESS || undefined,
    bankCountry: process.env.WISE_BANK_COUNTRY ?? "",
  };
}
