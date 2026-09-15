import { notFound } from "next/navigation";
import SellerProductForm from "@/components/seller/SellerProductForm";
import { getSellerProduct, type SellerProductKind } from "@/lib/seller/store";

type EditSellerProductPageProps = {
  params: Promise<{ kind: string; id: string }>;
};

export default async function EditSellerProductPage({ params }: EditSellerProductPageProps) {
  const { kind: kindParam, id } = await params;
  const kind: SellerProductKind | null = kindParam === "shop" || kindParam === "preorder" ? kindParam : null;
  const product = kind ? await getSellerProduct(kind, id) : null;

  if (!kind || !product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">商品を編集</h1>
      <div className="mt-6">
        <SellerProductForm kind={kind} initialProduct={product} />
      </div>
    </div>
  );
}
