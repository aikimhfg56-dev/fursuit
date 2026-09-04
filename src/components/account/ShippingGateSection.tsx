import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { AccountProfile } from "@/lib/account/profile";
import type { ShippingGateState } from "@/lib/account/shippingGate";
import ShippingDetailsForm from "./ShippingDetailsForm";
import SignInToContinue from "./SignInToContinue";

type ShippingGateSectionProps = {
  state: ShippingGateState;
  /** Locale-agnostic path to return to after sign-in, e.g. "/shop/sample-fox-fullsuit". */
  returnPath: string;
  signInDescription: string;
  profile: AccountProfile;
};

/**
 * Shared by the shop/pre-order checkout and the commission quote page —
 * both require an account and full name + address, collected lazily here
 * rather than at sign-up. Renders the sign-in prompt, the inline shipping
 * form, or a summary-with-edit-link depending on what's still missing;
 * callers render their actual form/checkout UI only once this reports "ready".
 */
export default async function ShippingGateSection({
  state,
  returnPath,
  signInDescription,
  profile,
}: ShippingGateSectionProps) {
  const t = await getTranslations("account.overview");
  const locale = (await getLocale()) as Locale;

  if (state === "signed_out") {
    return <SignInToContinue returnPath={returnPath} description={signInDescription} />;
  }

  if (state === "needs_details") {
    return (
      <div className="rounded-xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">{t("shippingHeading")}</h2>
        <p className="mb-4 mt-1 text-sm text-black/60 dark:text-white/60">{t("shippingMissingNote")}</p>
        <ShippingDetailsForm initialFullName={profile.fullName} initialAddress={profile.address} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-black/10 p-4 text-sm dark:border-white/10">
      <div>
        <p className="font-medium">{profile.fullName}</p>
        <p className="text-black/60 dark:text-white/60">
          {[
            profile.address?.line1,
            profile.address?.line2,
            profile.address?.city,
            profile.address?.postalCode,
            profile.address?.country,
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
      <Link href={`/${locale}/account`} className="shrink-0 underline">
        {t("edit")}
      </Link>
    </div>
  );
}
