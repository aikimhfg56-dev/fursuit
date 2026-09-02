import { getTranslations } from "next-intl/server";
import type { AccountAddress } from "@/lib/account/profile";
import type { OrderSummary } from "@/lib/sanity/queries";
import BillingPortalButton from "./BillingPortalButton";

type AccountOverviewProps = {
  name: string;
  email: string;
  dateOfBirth?: string;
  address?: AccountAddress;
  orders: OrderSummary[];
};

export default async function AccountOverview({
  name,
  email,
  dateOfBirth,
  address,
  orders,
}: AccountOverviewProps) {
  const t = await getTranslations("account.overview");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      <section className="mt-8 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">{t("profileHeading")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">{t("name")}</dt>
            <dd>{name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60 dark:text-white/60">{t("email")}</dt>
            <dd>{email}</dd>
          </div>
          {dateOfBirth && (
            <div className="flex justify-between">
              <dt className="text-black/60 dark:text-white/60">{t("dateOfBirth")}</dt>
              <dd>{dateOfBirth}</dd>
            </div>
          )}
          {address && (
            <div className="flex justify-between gap-6">
              <dt className="shrink-0 text-black/60 dark:text-white/60">{t("address")}</dt>
              <dd className="text-right">
                {[address.line1, address.line2, address.city, address.postalCode, address.country]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">{t("paymentHeading")}</h2>
        <p className="mt-2 text-sm text-black/70 dark:text-white/70">{t("paymentDescription")}</p>
        <div className="mt-4">
          <BillingPortalButton />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold">{t("ordersHeading")}</h2>
        {orders.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm">
            {orders.map((order) => (
              <li
                key={order._id}
                className="flex justify-between border-b border-black/10 pb-2 dark:border-white/10"
              >
                <span>{order.referenceCode ?? order._id}</span>
                <span className="text-black/60 dark:text-white/60">{order.paymentStatus}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">{t("noOrders")}</p>
        )}
      </section>
    </div>
  );
}
