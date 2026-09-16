import { listOrders, type OrderRecord } from "@/lib/orders/store";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe_card: "クレジットカード",
  stripe_alipay: "Alipay",
  stripe_revolut_pay: "Revolut Pay",
  paypal: "PayPal",
  wise: "銀行振込 (Wise)",
  coinbase: "暗号資産 (Coinbase)",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "保留中",
  awaiting_bank_transfer: "振込待ち",
  paid: "支払い済み",
  failed: "失敗",
  refunded: "返金済み",
};

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

function formatAmount(amount: number, currency: string) {
  const key = currency.toUpperCase();
  let formatter = currencyFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("ja-JP", { style: "currency", currency: key });
    currencyFormatterCache.set(key, formatter);
  }
  return formatter.format(amount);
}

export default async function SellerOrdersPage() {
  const orders = await listOrders();
  const preorderOrders = orders.filter((order) => order.productKind === "preorder");
  const shopOrders = orders.filter((order) => order.productKind !== "preorder");

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-bold tracking-tight">注文一覧</h1>

      <OrderSection title="セミオーダー" orders={preorderOrders} />
      <OrderSection title="ショップ" orders={shopOrders} />
    </div>
  );
}

function OrderSection({ title, orders }: { title: string; orders: OrderRecord[] }) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">まだ注文はありません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10">
          {orders.map((order) => (
            <li key={order.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {order.customerNumber && (
                    <span className="mr-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                      {order.customerNumber}
                    </span>
                  )}
                  {order.productName || "（商品名不明）"}
                </p>
                <p className="font-semibold">{formatAmount(order.amountTotal, order.currency)}</p>
              </div>
              <p className="mt-1 text-sm text-foreground/70">
                {order.customerName ?? "名前不明"}
                {order.customerEmail ? ` ・ ${order.customerEmail}` : ""}
              </p>
              <p className="mt-1 text-xs text-foreground/60">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod} ・{" "}
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus} ・ {order.referenceCode} ・{" "}
                {new Date(order.createdAt).toLocaleString("ja-JP")}
              </p>
              {order.shippingAddress && (
                <p className="mt-1 text-xs text-foreground/60">
                  配送先：
                  {[
                    order.shippingAddress.line1,
                    order.shippingAddress.line2,
                    order.shippingAddress.city,
                    order.shippingAddress.postalCode,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
