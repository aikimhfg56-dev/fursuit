"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { resolveProductImageUrl } from "@/lib/sanity/image";
import type { ProductImage } from "@/lib/sanity/queries";
import ProductImagePlaceholder from "./ProductImagePlaceholder";

type ProductGalleryProps = {
  images: ProductImage[];
  name: string;
  placeholderLabel: string;
};

/** Horizontal snap-scrolling gallery with a scroll-position progress bar, styled after product story pages. */
export default function ProductGallery({ images, name, placeholderLabel }: ProductGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const urls = images
    .map((image) => resolveProductImageUrl(image, 1200))
    .filter((url): url is string => Boolean(url));

  if (urls.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-2xl">
        <ProductImagePlaceholder label={placeholderLabel} />
      </div>
    );
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, index) => (
          <div
            key={url}
            className="aspect-square w-full flex-none snap-start overflow-hidden rounded-2xl bg-card-background transition-transform duration-300 hover:scale-[1.02] sm:w-[85%]"
          >
            <Image
              src={url}
              alt={`${name} ${index + 1}`}
              width={1200}
              height={1200}
              className="h-full w-full object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>
      {urls.length > 1 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${Math.min(Math.max(progress * 100, 100 / urls.length), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
