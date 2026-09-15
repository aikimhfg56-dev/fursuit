import FadeIn from "@/components/motion/FadeIn";
import ProductCard from "./ProductCard";
import type { PreorderProductSummary, ProductSummary } from "@/lib/sanity/queries";

type ProductGridProps = {
  products: (ProductSummary | PreorderProductSummary)[];
  kind: "shop" | "preorder";
};

const STAGGER_STEP = 0.08;
const MAX_STAGGER_DELAY = 0.4;

export default function ProductGrid({ products, kind }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <FadeIn key={product._id} delay={Math.min(index * STAGGER_STEP, MAX_STAGGER_DELAY)} y={16}>
          <ProductCard product={product} kind={kind} />
        </FadeIn>
      ))}
    </div>
  );
}
