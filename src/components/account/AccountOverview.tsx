import { getTranslations } from "next-intl/server";
import type { AccountAddress } from "@/lib/account/profile";
import type { OrderSummary } from "@/lib/sanity/queries";
import BillingPortalButton from "./BillingPortalButton";
import ShippingDetailsSection from "./ShippingDetailsSection";

type AccountOverviewProps = {
  username: string;
  email: string;
  fullName?: string;
  address?: AccountAddress;
  orders: OrderSummary[];
};

export default async function AccountOverview({
  username,
  email,
  fullName,
  address,
  orders,
}: AccountOverviewProps) {
  const t = await getTranslations("account.overview");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <section className="mt-8 rounded-xl border border-black/10 p-6">
        <h2 className="text-lg font-semibold">{t("profileHeading")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60">{t("nickname")}</dt>
            <dd>{username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">{t("email")}</dt>
            <dd>{email}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-6">
        <ShippingDetailsSection fullName={fullName} address={address} />
      </div>

      <section className="mt-6 rounded-xl border border-black/10 p-6">
        <h2 className="text-lg font-semibold">{t("paymentHeading")}</h2>
        <p className="mt-2 text-sm text-black/70">{t("paymentDescription")}</p>
        <div className="mt-4">
          <BillingPortalButton />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-black/10 p-6">
        <h2 className="text-lg font-semibold">{t("ordersHeading")}</h2>
        {orders.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm">
            {orders.map((order) => (
              <li
                key={order._id}
                className="flex justify-between border-b border-black/10 pb-2"
              >
                <span>{order.referenceCode ?? order._id}</span>
                <span className="text-black/60">{order.paymentStatus}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/60">{t("noOrders")}</p>
        )}
      </section>
    </div>
  );
}
