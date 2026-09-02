import { notFound } from "next/navigation";
import ProductDetailView from "@/components/product/ProductDetailView";
import { getPreorderProductBySlug } from "@/lib/sanity/queries";

type PreorderProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PreorderProductPage({ params }: PreorderProductPageProps) {
  const { slug } = await params;
  const product = await getPreorderProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailView product={product} kind="preorder" />;
}
