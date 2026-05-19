import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Tag, ShoppingBag, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ q?: string }>;
}

const COLLECTION_METADATA: Record<
  string,
  { title: string; subtitle: string; bg: string; isEmptyPlaceholder?: boolean }
> = {
  new: {
    title: "New Arrivals",
    subtitle: "Be the first to step into the latest releases, fresh styles, and seasonal additions.",
    bg: "from-amber-50/50 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
  },
  shoes: {
    title: "All Sneakers",
    subtitle: "Explore our complete curated catalog of premium sneakers and classic silhouettes.",
    bg: "from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950",
  },
  clothes: {
    title: "Apparel Collection",
    subtitle: "Elevated sportswear, premium threads, and streetwear essentials launching soon.",
    bg: "from-blue-50/40 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
    isEmptyPlaceholder: true,
  },
  accessories: {
    title: "Streetwear Accessories",
    subtitle: "Socks, premium bags, laces, and clean care kits to perfect your collection.",
    bg: "from-purple-50/40 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
    isEmptyPlaceholder: true,
  },
  brands: {
    title: "Partner Brands",
    subtitle: "Discover official collaborations and catalogs from Nike, Jordan, Adidas, and New Balance.",
    bg: "from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950",
  },
  premium: {
    title: "Premium Tier",
    subtitle: "Ultra-premium silhouettes and rare colorways priced above $150.",
    bg: "from-yellow-50/30 to-neutral-50 dark:from-amber-900/10 dark:to-neutral-950",
  },
  sale: {
    title: "Active Sales & Offers",
    subtitle: "High-demand styles on limited-time discounts. Act fast before stock runs out.",
    bg: "from-rose-50/40 to-neutral-50 dark:from-rose-950/10 dark:to-neutral-950",
  },
};

export default async function CollectionsPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const categoryKey = resolvedParams.category.toLowerCase();
  const searchQuery = resolvedSearch.q;

  const allowedCollections = ["new", "shoes", "clothes", "accessories", "brands", "premium", "sale"];
  if (!allowedCollections.includes(categoryKey)) {
    notFound();
  }

  const meta = COLLECTION_METADATA[categoryKey];

  // Dynamic DB Query Construction
  const whereClause: any = {};

  let orderByClause: any = {
    createdAt: "desc",
  };

  if (categoryKey === "shoes" && searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { brand: { name: { contains: searchQuery, mode: "insensitive" } } },
      { category: { name: { contains: searchQuery, mode: "insensitive" } } },
    ];
  } else if (categoryKey === "premium") {
    whereClause.price = { gte: 150 };
  } else if (categoryKey === "sale") {
    whereClause.compareAtPrice = { not: null };
  } else if (categoryKey === "clothes" || categoryKey === "accessories") {
    // Force zero results for clothing and accessories
    whereClause.id = "force-empty-result";
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      brand: true,
      category: true,
      variants: true,
    },
    orderBy: orderByClause,
  });

  return (
    <main className="w-full bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50 min-h-screen pb-16">
      
      {/* Header Banner */}
      <section className={`w-full py-12 md:py-16 bg-gradient-to-b ${meta.bg} border-b border-neutral-100 dark:border-neutral-900`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
            {searchQuery ? "Search Results" : "Collections"}
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white uppercase font-sans">
            {searchQuery ? `"${searchQuery}"` : meta.title}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
            {searchQuery ? `Showing matched sneakers for query: "${searchQuery}"` : meta.subtitle}
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {products.length} {products.length === 1 ? "Sneaker" : "Sneakers"} Found
          </p>
        </div>

        {/* Empty States */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 max-w-3xl mx-auto">
            {meta.isEmptyPlaceholder ? (
              <>
                <ShoppingBag className="mx-auto h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Collection Coming Soon
                </h3>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                  We are currently crafting a premium catalog for {meta.title.toLowerCase()}. Subscribe to our newsletter or stay tuned for the official drop event!
                </p>
                <div className="mt-6">
                  <Link href="/collections/shoes" className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2 text-xs font-bold text-white uppercase tracking-wider hover:bg-neutral-800 transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                    Browse Sneaker Catalog <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="mx-auto h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white">No Match Found</h3>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">We could not find any active products in this collection matching your specifications.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {products.map((product: any) => {
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
                <div key={product.id} className="group relative flex flex-col">
                  
                  {/* Image Container */}
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
                        className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
                        priority={false}
                      />
                      
                      {/* Secondary Hover Image */}
                      {secondaryImg && (
                        <Image
                          src={secondaryImg}
                          alt={`${product.name} alternate view`}
                          fill
                          sizes="(max-w-768px) 50vw, 25vw"
                          className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
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
                    {product.variants.length > 0 && (
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
        )}
      </section>

    </main>
  );
}
