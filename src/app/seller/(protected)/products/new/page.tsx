import SellerProductForm from "@/components/seller/SellerProductForm";
import type { SellerProductKind } from "@/lib/seller/store";

type NewSellerProductPageProps = {
  searchParams: Promise<{ kind?: string }>;
};

export default async function NewSellerProductPage({ searchParams }: NewSellerProductPageProps) {
  const { kind: kindParam } = await searchParams;
  const kind: SellerProductKind = kindParam === "preorder" ? "preorder" : "shop";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        新しい商品を登録({kind === "shop" ? "既製品" : "受注生産"})
      </h1>
      <div className="mt-6">
        <SellerProductForm kind={kind} />
      </div>
    </div>
  );
}
