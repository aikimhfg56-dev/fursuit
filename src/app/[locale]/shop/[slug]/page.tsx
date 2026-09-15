import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getShopProductDetail } from "@/lib/products/catalog";

type ShopProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const product = await getShopProductDetail(slug);

  if (!product) notFound();

  return <ProductDetailView product={product} kind="shop" />;
}
