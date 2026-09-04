import { currentUser } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import { getAccountProfile } from "@/lib/account/profile";
import { isClerkConfigured, isPaypalConfigured } from "@/lib/env";
import { processPaypalCapture } from "@/lib/orders/paypalCapture";
import { retrieveStripeCheckoutSession } from "@/lib/payments/stripe";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string; token?: string; reference?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const t = await getTranslations("checkoutResult");
  const { session_id: sessionId, token, reference } = await searchParams;

  let referenceCode = reference;
  let paid = false;

  if (sessionId) {
    const session = await retrieveStripeCheckoutSession(sessionId);
    referenceCode = session?.metadata?.referenceCode ?? referenceCode;
    paid = session?.payment_status === "paid";
  } else if (token && isPaypalConfigured()) {
    try {
      const user = isClerkConfigured() ? await currentUser() : null;
      const profile = user ? getAccountProfile(user) : {};
      const result = await processPaypalCapture(token, reference, {
        customerEmail: user?.primaryEmailAddress?.emailAddress,
        customerName: profile.fullName,
        shippingAddress: profile.address,
      });
      paid = result.status === "COMPLETED";
    } catch (error) {
      console.error("PayPal capture on success page failed", error);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">{paid ? t("title") : t("pendingTitle")}</h1>
      <p className="mt-3 text-black/70 dark:text-white/70">
        {paid ? t("description") : t("pendingDescription")}
      </p>
      {referenceCode && (
        <p className="mt-6 inline-block rounded border border-black/10 px-4 py-2 text-sm dark:border-white/10">
          {t("reference", { code: referenceCode })}
        </p>
      )}
    </div>
  );
}
