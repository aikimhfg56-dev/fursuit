import ProductCard from "./ProductCard";
import type { PreorderProductSummary, ProductSummary } from "@/lib/sanity/queries";

type ProductGridProps = {
  products: (ProductSummary | PreorderProductSummary)[];
  kind: "shop" | "preorder";
};

export default function ProductGrid({ products, kind }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} kind={kind} />
      ))}
    </div>
  );
}
