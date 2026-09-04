import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ShippingGateSection from "@/components/account/ShippingGateSection";
import InquiryForm from "@/components/forms/InquiryForm";
import { getAccountProfile } from "@/lib/account/profile";
import { getShippingGateState } from "@/lib/account/shippingGate";
import { isClerkConfigured } from "@/lib/env";
import { buildAlternateLanguages } from "@/lib/seo/alternates";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("commission.quote");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: buildAlternateLanguages("/commission/quote") },
  };
}

export default async function CommissionQuotePage() {
  const t = await getTranslations("commission.quote");
  const tAccount = await getTranslations("account");

  // Commission quotes require an account, same as shop/pre-order checkout —
  // see lib/account/shippingGate.ts.
  const user = isClerkConfigured() ? await currentUser() : null;
  const profile = user ? getAccountProfile(user) : {};
  const gateState = getShippingGateState(user?.id ?? null, profile);

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-black/70 dark:text-white/70">{t("description")}</p>
      <div className="mt-8 space-y-4">
        <ShippingGateSection
          state={gateState}
          returnPath="/commission/quote"
          signInDescription={tAccount("signInToRequestQuote")}
          profile={profile}
        />
        {gateState === "ready" && <InquiryForm variant="commission" />}
      </div>
    </div>
  );
}
