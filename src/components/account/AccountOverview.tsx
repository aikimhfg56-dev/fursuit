import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AccountAddress } from "@/lib/account/profile";
import type { OrderRecord } from "@/lib/orders/store";
import BillingPortalButton from "./BillingPortalButton";
import ShippingDetailsSection from "./ShippingDetailsSection";

type AccountOverviewProps = {
  username: string;
  email: string;
  fullName?: string;
  address?: AccountAddress;
  orders: OrderRecord[];
  unreadMessagesCount: number;
};

export default async function AccountOverview({
  username,
  email,
  fullName,
  address,
  orders,
  unreadMessagesCount,
}: AccountOverviewProps) {
  const t = await getTranslations("account.overview");
  const locale = await getLocale();
  const currencyFormatters = new Map<string, Intl.NumberFormat>();
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  function formatAmount(amount: number, currency: string) {
    const key = currency.toUpperCase();
    let formatter = currencyFormatters.get(key);
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, { style: "currency", currency: key });
      currencyFormatters.set(key, formatter);
    }
    return formatter.format(amount);
  }

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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("messagesHeading")}</h2>
            <p className="mt-1 text-sm text-black/70">{t("messagesDescription")}</p>
          </div>
          <Link
            href="/account/messages"
            className="relative shrink-0 rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/30"
          >
            {t("viewMessages")}
            {unreadMessagesCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                {unreadMessagesCount}
              </span>
            )}
          </Link>
        </div>
      </section>

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
          <ul className="mt-4 space-y-4 text-sm">
            {orders.map((order) => (
              <li key={order.id} className="border-b border-black/10 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">
                    {order.customerNumber && (
                      <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        {order.customerNumber}
                      </span>
                    )}
                    {order.productName || order.referenceCode}
                  </span>
                  <span className="font-semibold">{formatAmount(order.amountTotal, order.currency)}</span>
                </div>
                <p className="mt-1 text-black/60">
                  {t(`paymentMethods.${order.paymentMethod}`)} ・ {t(`paymentStatuses.${order.paymentStatus}`)}
                </p>
                <p className="mt-1 text-xs text-black/45">
                  {order.referenceCode} ・ {dateFormatter.format(new Date(order.createdAt))}
                </p>
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
