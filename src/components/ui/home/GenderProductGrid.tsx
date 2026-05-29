"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tag, Sparkles, ArrowDown } from "lucide-react";

interface GenderProductGridProps {
  initialProducts: any[];
}

export default function GenderProductGrid({ initialProducts }: GenderProductGridProps) {
  const [showAll, setShowAll] = useState(false);

  if (initialProducts.length === 0) {
    return (
      <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
        <Sparkles className="mx-auto h-8 w-8 text-neutral-400 dark:text-neutral-500" />
        <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">No Sneakers Available</h3>
        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Our stock for this collection is fully sold out. Check back soon!</p>
      </div>
    );
  }

  // Slice based on toggled state
  const displayedProducts = showAll ? initialProducts : initialProducts.slice(0, 6);
  const hasMore = initialProducts.length > 6;

  return (
    <div className="space-y-12">
      {/* Dynamic Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 transition-all duration-500">
        {displayedProducts.map((product: any, index: number) => {
          const primaryImg = product.images.find((img: any) => img.isPrimary)?.url || product.images[0]?.url;
          const secondaryImg = product.images.find((img: any) => !img.isPrimary)?.url;
          const hasDiscount = product.compareAtPrice !== null;
          const discountPercent = hasDiscount
            ? Math.round(
                ((Number(product.compareAtPrice) - Number(product.price)) /
                  Number(product.compareAtPrice)) *
                  100
              )
            : 0;

          return (
            <div
              key={product.id}
              className={`group relative flex flex-col transition-all duration-700 ease-out transform ${
                showAll && index >= 6 ? "animate-[fadeIn_0.6s_ease-out_both] opacity-0 scale-95" : ""
              }`}
              style={showAll && index >= 6 ? { animationDelay: `${(index - 6) * 75}ms` } : undefined}
            >
              {/* Image Container with premium transitions */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-850">
                {hasDiscount && (
                  <span className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                    <Tag className="h-3 w-3" />
                    {discountPercent}% OFF
                  </span>
                )}

                <Link href={`/products/${product.slug}`} className="block h-full w-full">
                  {/* Primary Image */}
                  <Image
                    src={primaryImg}
                    alt={product.name}
                    fill
                    sizes="(max-w-768px) 50vw, 25vw"
                    className="object-cover object-center transition-all duration-200 ease-out group-hover:scale-105"
                    priority={false}
                  />

                  {/* Secondary Hover Image */}
                  {secondaryImg && (
                    <Image
                      src={secondaryImg}
                      alt={`${product.name} alternate view`}
                      fill
                      sizes="(max-w-768px) 50vw, 25vw"
                      className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-105"
                    />
                  )}
                </Link>
              </div>

              {/* Metadata Content */}
              <div className="mt-4 flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                    {product.brand?.name || "Premium Brand"}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                    ⭐ {product.averageRating.toFixed(1)}
                  </span>
                </div>

                <h3 className="mt-1 text-sm font-bold tracking-tight text-neutral-900 dark:text-white line-clamp-1">
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </h3>

                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                  {product.category?.name || "Sneaker"}
                </p>

                {/* Pricing */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-white">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${Number(product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Colors swatches preview */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {Array.from(new Set(product.variants.map((v: any) => v.colorHex))).map((hex: any, i: number) => (
                      <span
                        key={i}
                        className="h-3 w-3 rounded-full border border-black/10 dark:border-white/10 ring-1 ring-offset-1 ring-transparent hover:ring-neutral-400 transition-all"
                        style={{ backgroundColor: hex } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View All / Toggle Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-8 py-3.5 text-xs font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{showAll ? "Show Less" : "View All Sneakers"}</span>
            <ArrowDown className={`h-4 w-4 transition-transform duration-300 ${showAll ? "rotate-180" : "group-hover:translate-y-0.5"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
