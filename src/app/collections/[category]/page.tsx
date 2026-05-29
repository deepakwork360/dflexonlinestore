import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Tag, ShoppingBag, ArrowRight } from "lucide-react";
import FilterSidebar from "@/components/ui/products/FilterSidebar";
import MobileFilterDrawer from "@/components/ui/products/MobileFilterDrawer";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    q?: string;
    brand?: string;
    category?: string;
    gender?: string;
    size?: string;
    priceRange?: string;
    onSale?: string;
  }>;
}

const COLLECTION_METADATA: Record<
  string,
  { title: string; subtitle: string; bg: string; image: string; isEmptyPlaceholder?: boolean }
> = {
  new: {
    title: "New Arrivals",
    subtitle: "Be the first to step into the latest releases, fresh styles, and seasonal additions.",
    bg: "from-amber-50/50 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
    image: "https://i.pinimg.com/1200x/d6/d9/06/d6d906b0e530fda21ba4df32c1ec042b.jpg",
  },
  shoes: {
    title: "",
    subtitle: "",
    bg: "from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950",
    image: "/images/2.webp",
  },
  clothes: {
    title: "",
    subtitle: "",
    bg: "from-blue-50/40 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
    image: "/images/1.webp",
    isEmptyPlaceholder: true,
  },
  accessories: {
    title: "",
    subtitle: "",
    bg: "from-purple-50/40 to-neutral-50 dark:from-neutral-900/30 dark:to-neutral-950",
    image: "/images/3.webp",
    isEmptyPlaceholder: true,
  },
  brands: {
    title: "",
    subtitle: "",
    bg: "from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950",
    image: "/images/5.webp",
  },
  premium: {
    title: "",
    subtitle: "",
    bg: "from-yellow-50/30 to-neutral-50 dark:from-amber-900/10 dark:to-neutral-950",
    image: "/images/6.webp",
  },
  sale: {
    title: "",
    subtitle: "",
    bg: "from-rose-50/40 to-neutral-50 dark:from-rose-950/10 dark:to-neutral-950",
    image: "/images/7.webp",
  },
};

export default async function CollectionsPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const categoryKey = resolvedParams.category.toLowerCase();
  const searchQuery = resolvedSearch.q;
  const selectedBrand = resolvedSearch.brand;
  const selectedCategory = resolvedSearch.category;
  const selectedGender = resolvedSearch.gender;
  const selectedSize = resolvedSearch.size;
  const selectedPriceRange = resolvedSearch.priceRange;
  const selectedOnSale = resolvedSearch.onSale === "true";

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

  // Base Collection Filters
  if (categoryKey === "shoes" && searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { brand: { name: { contains: searchQuery, mode: "insensitive" } } },
      { category: { name: { contains: searchQuery, mode: "insensitive" } } },
    ];
  } else if (categoryKey === "premium") {
    whereClause.price = { gte: 150 };
  } else if (categoryKey === "clothes" || categoryKey === "accessories") {
    whereClause.id = "force-empty-result";
  }

  // Dynamic Sidebar Filter Mapping
  if (selectedBrand) {
    whereClause.brand = { slug: selectedBrand };
  }

  if (selectedCategory) {
    whereClause.category = { slug: selectedCategory };
  }

  if (selectedGender) {
    whereClause.gender = selectedGender.toUpperCase();
  }

  if (selectedSize) {
    whereClause.variants = {
      some: {
        size: {
          name: selectedSize,
        },
      },
    };
  }

  if (selectedPriceRange) {
    const [minStr, maxStr] = selectedPriceRange.split("-");
    const minVal = parseFloat(minStr);
    const maxVal = parseFloat(maxStr);
    whereClause.price = {
      ...(whereClause.price || {}),
      gte: minVal,
      lte: maxVal,
    };
  }

  // On Sale filter: only products with a compareAtPrice (i.e. discounted)
  if (selectedOnSale) {
    whereClause.compareAtPrice = { not: null };
  }

  const queryOptions: any = {
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
  };

  // Limit to top 20 latest added shoes for the New arrivals collection
  if (categoryKey === "new") {
    queryOptions.take = 20;
  }

  const products = await prisma.product.findMany(queryOptions);

  // Fetch filter dropdown options dynamically from the DB to show accurate choices
  const dbBrands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const dbCategories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const dbSizes = await prisma.size.findMany({ orderBy: { value: "asc" } });

  return (
    <main className="w-full bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50 min-h-screen pb-16">
      
      <section className="relative w-full h-[200px] md:h-[45vh] overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 z-10 bg-black/40 md:bg-black/25" />
        <Image
          src={meta.image || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600&auto=format&fit=crop"}
          alt={meta.title}
          fill
          priority
          className="object-cover object-center select-none"
        />
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-white">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white leading-tight font-sans">
            {searchQuery ? `"${searchQuery}"` : meta.title}
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-xs md:text-sm text-neutral-200 leading-relaxed font-medium">
            {searchQuery ? `Showing matched sneakers for query: "${searchQuery}"` : meta.subtitle}
          </p>
        </div>
      </section>

      {/* Breadcrumb Navigation Bar */}
      <div className="w-full bg-[#FBFBFB] border-b border-neutral-100 py-3.5 px-4 lg:px-8 xl:px-12 flex items-center justify-between text-[11px] font-bold text-neutral-400 tracking-wider uppercase select-none">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-[#B61C38] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-800">
            {searchQuery ? "Search" : meta.title}
          </span>
        </div>
        <a href="javascript:history.back()" className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer">
          Back
        </a>
      </div>

      {/* Main Filter + Grid Section */}
      <section className="w-full px-4 lg:px-8 xl:px-12 mt-12">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 ml-5">
            {products.length} {products.length === 1 ? "Sneaker" : "Sneakers"} Found
          </p>
          {/* Mobile Filter sidetab drawer */}
          <div className="lg:hidden">
            <MobileFilterDrawer
              brands={dbBrands}
              categories={dbCategories}
              sizes={dbSizes}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Interactive Filter Sidebar (Sticky, Left Corner, ml-5) - hidden on mobile, inline on desktop */}
          <div className="hidden lg:block lg:w-[250px] shrink-0 ml-5 lg:sticky lg:top-24 lg:self-start z-10">
            <FilterSidebar 
              brands={dbBrands}
              categories={dbCategories}
              sizes={dbSizes}
            />
          </div>

          {/* Right Column: Dynamic Catalog Grid (Flex-1) */}
          <div className="flex-1">
            
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
                    <h3 className="mt-4 text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-widest">No Match Found</h3>
                    <p className="mt-2 text-xs text-neutral-555 dark:text-neutral-400 font-semibold uppercase tracking-wider">We could not find any sneakers in this collection matching your specifications.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
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
                    <div key={product.id} className="group relative flex flex-col transition-all duration-300">
                      
                      {/* Image Container */}
                      <div className="relative aspect-square w-full overflow-hidden rounded-none bg-[#FBFBFB] border border-neutral-200/50 group-hover:border-neutral-400 transition-all duration-500 shadow-xs">
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 z-10 rounded-none bg-rose-600 px-2.5 py-0.5 text-[8.5px] font-black text-white uppercase tracking-widest shadow-sm">
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

                          {/* Premium slide-down overlay on hover */}
                          {/* <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-xs py-2.5 border-b border-neutral-150/40 -translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out flex items-center justify-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest text-neutral-900 select-none">
                            Explore Details
                          </div> */}
                        </Link>
                      </div>

                      {/* Metadata Content */}
                      <div className="mt-3.5 flex flex-col flex-1 px-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black tracking-[0.2em] text-[#B61C38] uppercase">
                            {product.brand?.name || "Premium Brand"}
                          </span>
                          <span className="text-[9px] font-black text-neutral-400 tracking-wider">
                            ★ {product.averageRating.toFixed(1)}
                          </span>
                        </div>

                        <h3 className="mt-1 text-xs font-black uppercase tracking-wider text-neutral-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          <Link href={`/products/${product.slug}`} className="hover:underline">
                            {product.name}
                          </Link>
                        </h3>

                        <p className="mt-0.5 text-[11px] font-medium text-neutral-500 line-clamp-1">
                          {product.category?.name || "Sneaker"}
                        </p>

                        {/* Pricing */}
                        <div className="mt-2.5 flex items-baseline gap-2">
                          <span className="text-sm font-black text-neutral-900 font-sans">
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

          </div>

        </div>

      </section>

    </main>
  );
}
