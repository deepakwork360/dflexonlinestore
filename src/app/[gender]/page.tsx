import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Tag } from "lucide-react";
import Banner from "@/components/ui/home/banner";

interface Props {
  params: Promise<{ gender: string }>;
}

const GENDER_LABELS: Record<string, { title: string; subtitle: string; bg: string }> = {
  men: {
    title: "Men's Sneakers",
    subtitle: "Engineered for style, performance, and ultimate street comfort.",
    bg: "from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950",
  },
  women: {
    title: "Women's Sneakers",
    subtitle: "Step into elegant comfort, contemporary silhouettes, and active fashion.",
    bg: "from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950",
  },
  kids: {
    title: "Kids' Sneakers",
    subtitle: "Bright, durable, and packed with lightweight support for active play.",
    bg: "from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950",
  },
};

const FLAGSHIP_CONFIG: Record<
  string,
  {
    title: string;
    description: string;
    price: string;
    image: string;
    tag: string;
  }
> = {
  men: {
    title: "Air Jordan 4 Retro",
    description: "The legendary silhouette returns in its iconic Military Blue style. Crafted with premium white leather, neutral grey suede overlays, and vibrant industrial blue accents.",
    price: "215.00",
    image: "https://images.unsplash.com/photo-1706571717924-934a8a7c2aa7?q=80&w=1039&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Men's Flagship",
  },
  women: {
    title: "Nike Dunk Low Panda",
    description: "The street-fashion icon returned with crisp material overlays and vintage court style. Lightweight daily cushioning built for everyday contemporary fashion.",
    price: "115.00",
    image: "https://images.unsplash.com/photo-1637844528486-6dc108bd5c7f?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Women's Flagship",
  },
  kids: {
    title: "Nike Air Max 270",
    description: "Designed for all-day comfort, active play, and lightweight support. Featuring Nike's first lifestyle Air Max unit for supersoft bounce and cushioning.",
    price: "130.00",
    image: "https://images.unsplash.com/photo-1658492572022-ecf972b354a0?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    tag: "Kids' Flagship",
  },
};

export default async function GenderCollectionPage({ params }: Props) {
  const resolvedParams = await params;
  const genderKey = resolvedParams.gender?.toLowerCase();

  // Guard against non-gender routes to prevent hijacking static routes
  const allowed = ["men", "women", "kids"];
  if (!allowed.includes(genderKey)) {
    notFound();
  }

  const genderLabel = GENDER_LABELS[genderKey];
  const flagship = FLAGSHIP_CONFIG[genderKey];
  const dbGender = genderKey.toUpperCase() as "MEN" | "WOMEN" | "KIDS";

  // Query top 12 latest arrivals for New Collection section (only showcasing active category/gender releases)
  const newCollectionProducts = await prisma.product.findMany({
    where: {
      gender: dbGender,
    },
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
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  const brandCards = await prisma.brand.findMany({
    include: {
      products: {
        where: {
          gender: dbGender,
        },
        include: {
          images: {
            orderBy: {
              sortOrder: "asc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      name: "asc",
    },
    take: 5,
  });

  return (
    <main className="w-full bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50 min-h-screen pb-0">

      <Banner gender={genderKey} />

      {/* 1. New Collection Section */}
      <section className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 xl:px-16 mt-16 mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-500">
              Fresh Arrivals
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase mt-1 font-sans">
              New Collection
            </h2>
          </div>
          <Link
            href={`/collections/shoes?gender=${genderKey}`}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-6 py-2.5 text-xs font-bold uppercase tracking-widest shadow-md transition-all hover:scale-105 active:scale-95"
          >
            View All Products
          </Link>
        </div>

        {/* Responsive Grid matching request: Exactly 2 columns on mobile (showing 4 products), 3 on md, 6 on lg */}
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3.5 gap-y-7 sm:gap-x-5 sm:gap-y-8">
          {newCollectionProducts.map((product: any, idx: number) => {
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

            // Visibility classes: Exactly 4 products on mobile/tablet (2 rows of 2 in 2-column layout), 6 products on md and up
            let visibilityClass = "block";
            if (idx >= 6 && idx <= 5) {
              visibilityClass = "hidden md:block";
            } else if (idx >= 6) {
              visibilityClass = "hidden";
            }

            return (
              <div key={product.id} className={`group relative flex flex-col transition-all duration-300 hover:-translate-y-1.5 ${visibilityClass}`}>
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800 transition-all duration-500 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.35)]">
                  {hasDiscount && (
                    <span className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-sm">
                      <Tag className="h-3 w-3" />
                      {discountPercent}% OFF
                    </span>
                  )}
                  <Link href={`/products/${product.slug}`} className="block h-full w-full">
                    <Image
                      src={primaryImg}
                      alt={product.name}
                      fill
                      sizes="(max-w-768px) 50vw, (max-w-1024px) 33vw, 16vw"
                      className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
                      priority={false}
                    />
                    {secondaryImg && (
                      <Image
                        src={secondaryImg}
                        alt={`${product.name} alternate view`}
                        fill
                        sizes="(max-w-768px) 50vw, (max-w-1024px) 33vw, 16vw"
                        className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}
                    {/* Premium Hover Overlay Action */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      {/* <span className="bg-white/95 dark:bg-neutral-950/95 backdrop-blur-sm text-neutral-900 dark:text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out hidden md:inline-block">
                        Quick View
                      </span> */}
                    </div>
                  </Link>
                </div>
                <div className="mt-3.5 flex flex-col flex-1 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold tracking-[0.15em] text-neutral-400 dark:text-neutral-500 uppercase">
                      {product.brand?.name || "Premium Brand"}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 rounded-full">
                      ★ {product.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-extrabold tracking-tight text-neutral-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                    <Link href={`/products/${product.slug}`} className="hover:underline">
                      {product.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 line-clamp-1">
                    {product.category?.name || "Sneaker"}
                  </p>
                  <div className="mt-2.5 flex items-baseline gap-2">
                    <span className="text-sm font-black text-neutral-900 dark:text-white font-sans">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                        ${Number(product.compareAtPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Curated Style Edits Section */}
      <section className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 xl:px-16 mb-20">
        <div className="border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-500">
            Style Edits
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase mt-1 font-sans">
            Curated Collections
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[640px]">
          {/* Left Column: Stacked 2 Cards */}
          <div className="w-full lg:w-[42%] flex flex-col gap-6 lg:h-full">
            {/* 1. Basketball Card */}
            <Link
              href={`/collections/shoes?gender=${genderKey}&category=basketball`}
              className="flex-1 relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-200/10 shadow-lg group min-h-[280px] block"
            >
              <Image
                src="https://i.pinimg.com/1200x/59/ec/49/59ec49e0a6e458ddc23d5f219d242ce6.jpg"
                alt="Basketball Collection"
                fill
                sizes="(max-w-1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-75 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left space-y-2">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em]">
                  Court Performance
                </span>
                <h3 className="text-2xl font-black uppercase text-white tracking-wider font-sans group-hover:text-rose-400 transition-colors">
                  Basketball
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed max-w-sm">
                  High-top court shoes optimized for maximum grip and performance.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white border-b-2 border-rose-500 pb-0.5 group-hover:text-rose-400 transition-colors">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>

            {/* 2. Lifestyle Card */}
            <Link
              href={`/collections/shoes?gender=${genderKey}&category=lifestyle`}
              className="flex-1 relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-200/10 shadow-lg group min-h-[280px] block"
            >
              <Image
                src="https://i.pinimg.com/1200x/18/d3/88/18d3880e3fb4006876f1e5268517ce15.jpg"
                alt="Lifestyle Collection"
                fill
                sizes="(max-w-1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-75 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left space-y-2">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.25em]">
                  Everyday Curation
                </span>
                <h3 className="text-2xl font-black uppercase text-white tracking-wider font-sans group-hover:text-rose-400 transition-colors">
                  Lifestyle
                </h3>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed max-w-sm">
                  Casual streetwear builds designed for everyday comfort and clean looks.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white border-b-2 border-rose-500 pb-0.5 group-hover:text-rose-400 transition-colors">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Column: One Large Editorial Card for Running */}
          <Link
            href={`/collections/shoes?gender=${genderKey}&category=running`}
            className="w-full lg:w-[58%] relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-200/10 shadow-lg group min-h-[400px] lg:h-full block"
          >
            <Image
              src="https://i.pinimg.com/1200x/cd/68/aa/cd68aa257b0310cc65237e3e3b5b1a27.jpg"
              alt="Running Collection"
              fill
              sizes="(max-w-1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-70 group-hover:opacity-55"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            
            <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end text-left space-y-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                  ⚡ High-Performance
                </span>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight leading-none font-sans pt-2">
                  Running
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed max-w-lg">
                Engineered for high-intensity running and superior everyday speed. Featuring ultra-breathable mesh fabrics, advanced sole mechanics, and responsive premium cushions.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition-all group-hover:bg-neutral-100 group-hover:scale-105 active:scale-95">
                  Explore Collection &rarr;
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

         {/* 3. Shop by Brand Curation Strip */}
      <section className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 xl:px-16 mb-24">
        <div className="border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-500">
            Partnerships
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase mt-1 font-sans">
            Shop by Brand
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
          {brandCards.map((brand) => {
            const imageUrl =
              brand.logo ||
              brand.products[0]?.images[0]?.url ||
              "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1200&auto=format&fit=crop";

            return (
            <Link
              key={brand.id}
              href={`/collections/shoes?gender=${genderKey}&brand=${brand.slug}`}
              className="group relative overflow-hidden rounded-sm aspect-[4/5] w-full flex flex-col justify-end p-5 text-left bg-neutral-900 shadow-md border border-neutral-200/10"
            >
              {/* Background Image */}
              <Image
                src={imageUrl}
                alt={`${brand.name} collection`}
                fill
                sizes="(max-w-768px) 50vw, 20vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-60"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/95" />

              {/* Text Layer */}
              <div className="relative z-10 space-y-1">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block transform translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  Collection
                </span>
                <h3 className="text-xl font-black uppercase text-white tracking-wider font-sans group-hover:scale-105 origin-left transition-transform duration-300">
                  {brand.name}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 inline-flex items-center gap-1 group-hover:text-rose-400 transition-colors">
                  Explore &rarr;
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </section>



      {/* 4. flagship Spotlight Section */}
      <section className="mx-auto max-w-screen w-full px-4 sm:px-6 lg:px-12 xl:px-16 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-950 text-white min-h-[400px] flex flex-col md:flex-row border border-neutral-900 shadow-xl">
          <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 text-left relative z-10 bg-neutral-950">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/20 px-3 py-1 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-500/25 w-max">
              {flagship.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none font-sans">
              {flagship.title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed max-w-md">
              {flagship.description}
            </p>
            <div className="pt-2">
              <Link
                href={`/collections/shoes?gender=${genderKey}`}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition-all hover:bg-neutral-100 hover:scale-105 active:scale-95"
              >
                Buy Now — ${flagship.price}
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
            <Image
              src={flagship.image}
              alt={`${flagship.title} Flagship Showcase`}
              fill
              sizes="(max-w-768px) 100vw, 50vw"
              className="object-cover select-none"
              style={{ objectPosition: "50% 50%" }}
            />
          </div>
        </div>
      </section>

      {/* 5. The Dflex Premium Experience Section */}
      <section className="w-full bg-neutral-50 dark:bg-neutral-900/40 border-t border-neutral-200/40 dark:border-neutral-800 py-12 mt-20">
        <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 text-center">
            {[
              {
                title: "Complimentary Express Delivery",
                desc: "Free secure priority worldwide shipping on all orders over $100.",
                highlight: "Free Shipping"
              },
              {
                title: "30-Day Premium Returns",
                desc: "Hassle-free sizing exchanges and standard priority refunds.",
                highlight: "Easy Returns"
              },
              {
                title: "Verified 100% Authentic",
                desc: "Direct-from-manufacturer sourcing checked by sneaker specialists.",
                highlight: "100% Authentic"
              },
              {
                title: "24/7 VIP Concierge Care",
                desc: "Priority chat and dedicated concierge support for sneaker sizing.",
                highlight: "VIP Support"
              }
            ].map((perk, i) => (
              <div key={i} className={`flex flex-col items-center justify-center p-4 ${i > 0 ? "pt-8 md:pt-4" : ""}`}>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-500/25 px-2.5 py-0.5 rounded-full bg-rose-500/5 mb-3">
                  {perk.highlight}
                </span>
                <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-tight">
                  {perk.title}
                </h3>
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-[220px]">
                  {perk.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

    </main>
  );
}
