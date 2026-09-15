import Link from "next/link";
import SellerDeleteButton from "@/components/seller/SellerDeleteButton";
import { listSellerProducts, type SellerProductKind, type SellerProductRecord } from "@/lib/seller/store";

const STOCK_LABELS: Record<string, string> = {
  in_stock: "在庫あり",
  low_stock: "残りわずか",
  sold_out: "売り切れ",
};

const PREORDER_LABELS: Record<string, string> = {
  open: "受付中",
  closing_soon: "まもなく締切",
  closed: "受付終了",
  in_production: "制作中",
};

export default async function SellerDashboardPage() {
  const [shopProducts, preorderProducts] = await Promise.all([
    listSellerProducts("shop"),
    listSellerProducts("preorder"),
  ]);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">商品一覧</h1>
        <div className="flex gap-3">
          <Link
            href="/seller/products/new?kind=shop"
            className="rounded-2xl bg-cta-background px-4 py-2 text-sm font-medium text-cta-foreground transition hover:opacity-90"
          >
            + 新しい商品(既製品)
          </Link>
          <Link
            href="/seller/products/new?kind=preorder"
            className="rounded-2xl border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black/30"
          >
            + 新しい商品(受注生産)
          </Link>
        </div>
      </div>

      <ProductSection title="既製品(Shop)" kind="shop" products={shopProducts} />
      <ProductSection title="受注生産(Pre-Order)" kind="preorder" products={preorderProducts} />
    </div>
  );
}

function ProductSection({
  title,
  kind,
  products,
}: {
  title: string;
  kind: SellerProductKind;
  products: SellerProductRecord[];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold">{title}</h2>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/60">まだ商品がありません。</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10">
          {products.map((product) => (
            <li key={product.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 flex-none overflow-hidden rounded-lg bg-black/5">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- internal admin tool, plain <img> avoids next/image sizing config for arbitrary uploads
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{product.name}</p>
                <p className="text-sm text-foreground/60">
                  ${product.basePrice.toFixed(2)} ・ {STOCK_LABELS[product.stockStatus]}
                  {product.kind === "preorder" && product.preorderStatus
                    ? ` ・ ${PREORDER_LABELS[product.preorderStatus]}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/seller/products/${kind}/${product.id}/edit`}
                className="text-sm text-accent underline-offset-2 hover:underline"
              >
                編集
              </Link>
              <SellerDeleteButton kind={kind} id={product.id} productName={product.name} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
