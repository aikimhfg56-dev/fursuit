import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getReadyMadeProductBySlug } from "@/lib/sanity/queries";

type ShopProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const product = await getReadyMadeProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailView product={product} kind="shop" />;
}
