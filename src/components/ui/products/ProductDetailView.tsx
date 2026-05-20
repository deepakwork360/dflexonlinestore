"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Star,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string | null;
    price: string;
    compareAtPrice: string | null;
    gender: "MEN" | "WOMEN" | "KIDS";
    averageRating: number;
    reviewCount: number;
    brand: { name: string; slug: string; logo: string | null } | null;
    category: { name: string; slug: string } | null;
    images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean }>;
    variants: Array<{
      id: string;
      sizeId: string;
      color: string;
      colorHex: string | null;
      sku: string;
      price: string | null;
      compareAtPrice: string | null;
      stock: number;
      size: { id: string; name: string; value: string; system: string };
    }>;
    reviews: Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      verifiedPurchase: boolean;
      createdAt: string;
      user: { name: string | null; image: string | null };
    }>;
  };
  recommended: Array<{
    id: string;
    name: string;
    slug: string;
    price: string;
    compareAtPrice: string | null;
    brand: { name: string } | null;
    images: Array<{ url: string }>;
  }>;
}

export default function ProductDetailView({ product, recommended }: ProductDetailViewProps) {
  // Extract all unique colors from variants
  const uniqueColors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string | null }>();
    product.variants.forEach((v) => {
      if (v.color && !map.has(v.color)) {
        map.set(v.color, { name: v.color, hex: v.colorHex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // States
  const [selectedColor, setSelectedColor] = useState<string>(
    uniqueColors[0]?.name || ""
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "specifications" | "shipping">("details");

  // Filter variants belonging to selected color
  const colorVariants = useMemo(() => {
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  // Find active variant (if size is selected)
  const activeVariant = useMemo(() => {
    return colorVariants.find((v) => v.sizeId === selectedSizeId);
  }, [colorVariants, selectedSizeId]);

  // Gallery images (exactly 4 photos to populate our Besnard grid layout)
  const galleryImages = useMemo(() => {
    const list = [...product.images];
    if (list.length < 4 && list.length > 0) {
      const baseImg = list[0].url;
      const angles = [
        "&auto=format&fit=crop&w=800&q=80&fit=facearea", 
        "&auto=format&fit=crop&w=800&q=80&sat=-50", 
        "&auto=format&fit=crop&w=800&q=80&hue=290"
      ];
      for (let i = list.length; i < 4; i++) {
        list.push({
          id: `virtual-${i}`,
          url: `${baseImg}${angles[i % angles.length]}`,
          altText: `${product.name} Alternative Angle View`,
          isPrimary: false,
        });
      }
    }
    return list.slice(0, 4);
  }, [product.images, product.name]);

  // Pricing math based on active selection
  const priceDisplay = activeVariant?.price ? activeVariant.price : product.price;
  const comparePriceDisplay = activeVariant?.compareAtPrice ? activeVariant.compareAtPrice : product.compareAtPrice;
  const hasDiscount = comparePriceDisplay !== null;
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(comparePriceDisplay) - Number(priceDisplay)) / Number(comparePriceDisplay)) * 100
      )
    : 0;

  // Actions
  const { addToCart, openDrawer } = useCart();
  const router = useRouter();

  const buildCartItem = () => {
    if (!selectedSizeId) return null;
    const variant = colorVariants.find((v) => v.sizeId === selectedSizeId);
    if (!variant) return null;
    const primaryImg =
      product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url || "";
    return {
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: primaryImg,
      brand: product.brand?.name ?? "Brand",
      size: variant.size.name,
      color: selectedColor,
      colorHex: variant.colorHex ?? "",
      price: Number(variant.price ?? product.price),
      quantity,
      stock: variant.stock,
    };
  };

  const handleAddToCart = () => {
    if (!selectedSizeId) {
      toast.error("Please select a sneaker size before adding to cart!", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    openDrawer();
    toast.success(`${product.name} added to your bag!`, {
      position: "bottom-right",
      duration: 3000,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSizeId) {
      toast.error("Please select a sneaker size to proceed!", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Saved ${product.name} to your wishlist!`, {
        icon: <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />,
        position: "top-center",
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-12 bg-white text-neutral-900">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 mb-8 tracking-widest uppercase">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-black transition-colors">
          {product.gender}
        </Link>
        <span>/</span>
        <span className="text-neutral-800 font-extrabold truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* LEFT COLUMN: Premium Asymmetric Image Gallery Grid (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* 1. Large Showcase Top Image */}
          <div className="aspect-[4/3] relative w-full overflow-hidden rounded-none bg-neutral-50 border border-neutral-150/40 group shadow-sm">
            {/* Gender Pill Overlay */}
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-none bg-black px-3.5 py-1 text-[9px] font-bold text-white uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-rose-500 animate-pulse" />
              {product.gender}
            </span>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-none bg-rose-600 px-3.5 py-1 text-[9px] font-black text-white uppercase tracking-wider shadow-sm">
                SAVE {discountPercent}%
              </span>
            )}

            <Image
              src={galleryImages[0]?.url}
              alt={galleryImages[0]?.altText || product.name}
              fill
              sizes="(max-w-1024px) 100vw, 55vw"
              priority
              className="object-cover object-center select-none"
            />
          </div>

          {/* 2. Middle Row: Two Square Images Side-by-Side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square relative w-full overflow-hidden rounded-none bg-neutral-50 border border-neutral-150/40">
              <Image
                src={galleryImages[1]?.url}
                alt={galleryImages[1]?.altText || product.name}
                fill
                sizes="(max-w-1024px) 50vw, 28vw"
                className="object-cover object-center select-none"
              />
            </div>
            <div className="aspect-square relative w-full overflow-hidden rounded-none bg-neutral-50 border border-neutral-150/40">
              <Image
                src={galleryImages[2]?.url}
                alt={galleryImages[2]?.altText || product.name}
                fill
                sizes="(max-w-1024px) 50vw, 28vw"
                className="object-cover object-center select-none"
              />
            </div>
          </div>

          {/* 3. Bottom Row: One Wide Close-Up Image */}
          <div className="aspect-[2/1] relative w-full overflow-hidden rounded-none bg-neutral-50 border border-neutral-150/40">
            <Image
              src={galleryImages[3]?.url}
              alt={galleryImages[3]?.altText || product.name}
              fill
              sizes="(max-w-1024px) 100vw, 55vw"
              className="object-cover object-center select-none"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Besnard-Style Clean Details (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-6 lg:py-2">
          
          {/* Brand releasing tag */}
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
              {product.brand?.name || "Premium Release"}
            </span>
          </div>

          {/* Luxury Header Titles */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-[0.08em] text-neutral-950 font-sans leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Category: {product.category?.name || "Lifestyle"}
              </p>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold text-neutral-400">
                    {product.averageRating.toFixed(1)} ({product.reviewCount} Reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Luxury Price Display */}
          <div className="flex items-baseline gap-4 py-2 border-b border-neutral-100 pb-5">
            <span className="text-2xl font-normal tracking-wide text-neutral-950">
              ${Number(priceDisplay).toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-450 line-through font-medium">
                  ${Number(comparePriceDisplay).toFixed(2)}
                </span>
                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-none border border-rose-100">
                  Save ${Math.abs(Number(comparePriceDisplay) - Number(priceDisplay)).toFixed(0)}
                </span>
              </div>
            )}
          </div>

          {/* Short elegant description */}
          <p className="text-xs text-neutral-500 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Luxury Specifications vertical list (Besnard Inspired) */}
          <div className="space-y-2 text-xs text-neutral-600 mt-6 border-t border-neutral-100 pt-6">
            <div>
              <span className="font-bold text-neutral-400 uppercase tracking-[0.15em] block mb-2">Specs:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-0.5">
              <span className="text-neutral-400 font-medium uppercase tracking-wider">Brand:</span>
              <span className="col-span-2 text-neutral-850 font-bold uppercase tracking-wider">{product.brand?.name || "Premium Brand"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-0.5">
              <span className="text-neutral-400 font-medium uppercase tracking-wider">Category:</span>
              <span className="col-span-2 text-neutral-850 font-bold uppercase tracking-wider">{product.category?.name || "Sneaker"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-0.5">
              <span className="text-neutral-400 font-medium uppercase tracking-wider">Composition:</span>
              <span className="col-span-2 text-neutral-850 font-bold uppercase tracking-wider">Premium Leather / Vulcanized Rubber Sole</span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-0.5">
              <span className="text-neutral-400 font-medium uppercase tracking-wider">Gender:</span>
              <span className="col-span-2 text-neutral-850 font-bold uppercase tracking-wider">{product.gender}</span>
            </div>
            {product.sku && (
              <div className="grid grid-cols-3 gap-2 py-0.5">
                <span className="text-neutral-400 font-medium uppercase tracking-wider">SKU:</span>
                <span className="col-span-2 text-neutral-850 font-mono uppercase tracking-wider">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Color Box Selection (Besnard Swatch Style) */}
          {uniqueColors.length > 0 && (
            <div className="space-y-2.5 mt-6 border-t border-neutral-100 pt-6">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">
                COLOR:
              </span>
              <div className="flex items-center gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedSizeId(""); // Reset size choice on color change
                    }}
                    className={`relative h-6 w-6 rounded-none border transition-all duration-200 cursor-pointer ${
                      selectedColor === color.name
                        ? "border-black scale-110 ring-2 ring-neutral-100"
                        : "border-neutral-250 hover:border-neutral-400"
                    }`}
                    style={{ backgroundColor: color.hex || "#cccccc" }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Select list (Besnard Style Guide layout) */}
          <div className="space-y-3 mt-6 border-t border-neutral-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                SIZE GUIDE:
              </span>
              <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest flex items-center gap-1">
                <Info className="h-3 w-3" /> System: US Sizes
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-neutral-450">
              {colorVariants.map((v) => {
                const isOutOfStock = v.stock <= 0;
                const isSelected = selectedSizeId === v.sizeId;

                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSizeId(v.sizeId)}
                    className={`pb-0.5 tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "text-black border-b-2 border-black font-black scale-105"
                        : isOutOfStock
                        ? "text-neutral-200 line-through cursor-not-allowed"
                        : "text-neutral-400 hover:text-neutral-850"
                    }`}
                  >
                    {v.size.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper + Stacked Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-4">
              
              {/* Stepper counter */}
              <div className="flex items-center border border-neutral-250 rounded-none bg-white px-2 py-1">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-2 text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-xs font-bold select-none text-neutral-850">
                  {quantity}
                </span>
                <button
                  disabled={activeVariant && quantity >= activeVariant.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* BUY PRODUCT Button */}
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-none bg-black text-white hover:bg-neutral-800 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm"
              >
                BUY PRODUCT
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-none border transition-all duration-350 active:scale-90 cursor-pointer ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-neutral-250 bg-white text-neutral-500 hover:text-rose-500"
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-4.5 w-4.5 stroke-[2] ${isWishlisted ? "fill-white" : ""}`} />
              </button>

            </div>

            {/* ADD TO CART Button */}
            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center rounded-none border border-neutral-300 text-neutral-800 hover:bg-neutral-50 py-3.5 text-xs font-bold uppercase tracking-[0.18em] transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2 stroke-[2.5]" />
              <span>ADD TO CART</span>
            </button>
          </div>

          {/* Guarantees row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-100 text-left">
            <div className="flex flex-col space-y-1">
              <Truck className="h-4.5 w-4.5 text-neutral-500" />
              <span className="text-[9px] font-bold text-neutral-900 uppercase tracking-widest">
                Free Delivery
              </span>
              <span className="text-[8px] text-neutral-450 font-semibold">
                Standard order $100+
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <RotateCcw className="h-4.5 w-4.5 text-neutral-500" />
              <span className="text-[9px] font-bold text-neutral-900 uppercase tracking-widest">
                30 Day Returns
              </span>
              <span className="text-[8px] text-neutral-450 font-semibold">
                Hassle-free labels
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <ShieldCheck className="h-4.5 w-4.5 text-neutral-500" />
              <span className="text-[9px] font-bold text-neutral-900 uppercase tracking-widest">
                100% Authentic
              </span>
              <span className="text-[8px] text-neutral-450 font-semibold">
                Direct brand source
              </span>
            </div>
          </div>

          {/* Tabbed Spec Sheets */}
          <div className="pt-6 border-t border-neutral-100">
            <div className="flex border-b border-neutral-150">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "details"
                    ? "border-black text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "specifications"
                    ? "border-black text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "shipping"
                    ? "border-black text-neutral-950"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Shipping
              </button>
            </div>

            <div className="py-4 text-xs text-neutral-500 leading-relaxed font-medium">
              {activeTab === "details" && (
                <div className="space-y-2 text-left">
                  <p>{product.description}</p>
                  <p>Step into next-level comfort with this high-precision design constructed from sustainable premium materials. Built to adapt beautifully to your natural stride while supporting high-impact street daily fashion aesthetics.</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-2 text-left">
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100">
                    <span className="font-bold text-neutral-800">Model SKU:</span>
                    <span className="col-span-2 tracking-wide font-mono uppercase text-neutral-600">{product.sku || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100">
                    <span className="font-bold text-neutral-800">Release Brand:</span>
                    <span className="col-span-2 text-neutral-600">{product.brand?.name || "Premium Brand"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100">
                    <span className="font-bold text-neutral-800">Catalog Category:</span>
                    <span className="col-span-2 text-neutral-600">{product.category?.name || "Premium Sneaker"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5">
                    <span className="font-bold text-neutral-800">Gender Target:</span>
                    <span className="col-span-2 capitalize text-neutral-600">{product.gender.toLowerCase()}</span>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-2 text-left">
                  <p>📦 **Fast Premium Delivery:** Orders placed are compiled and shipped within 24-48 business hours. Delivery typically averages 3-5 standard business days.</p>
                  <p>🔄 **Hassle-Free 30-Day Returns:** We provide pre-paid return shipment labels. Try them comfortably in your home; if the sizing or style is not to your liking, return them within 30 days in original packaging for a 100% refund.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {recommended && recommended.length > 0 && (
        <section className="mt-24 border-t border-neutral-150/60 pt-16">
          <div className="flex items-center justify-between border-b border-neutral-150/60 pb-4 mb-8">
            <h2 className="text-lg font-light uppercase tracking-[0.18em] text-neutral-900 font-sans">
              RECOMMEND <span className="font-bold text-neutral-400">PRODUCTS</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map((item) => {
              const primaryImg = item.images[0]?.url || "";
              return (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group flex flex-col text-left hover:scale-[1.01] transition-transform duration-350"
                >
                  <div className="aspect-[4/5] relative w-full overflow-hidden rounded-none bg-neutral-50 border border-neutral-150/40">
                    <Image
                      src={primaryImg}
                      alt={item.name}
                      fill
                      sizes="(max-w-768px) 50vw, 25vw"
                      className="object-cover object-center transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-[9px] font-bold tracking-[0.15em] text-neutral-400 uppercase">
                      {item.brand?.name || "Premium Brand"}
                    </span>
                    <h3 className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-900 line-clamp-1 group-hover:underline">
                      {item.name}
                    </h3>
                    <span className="mt-1.5 text-xs font-black text-neutral-950">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CUSTOMER REVIEWS PORTAL SECTION */}
      <section className="mt-20 border-t border-neutral-150/60 pt-16 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-150/60 pb-6 mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-450">
              Community Ratings
            </span>
            <h2 className="text-2xl font-light uppercase text-neutral-950 tracking-[0.08em] mt-1 font-sans">
              Customer Reviews
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center md:text-right">
              <span className="text-3xl font-black text-neutral-950">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-neutral-400"> out of 5</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 stroke-[2] ${
                      i < Math.round(product.averageRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Based on {product.reviewCount} customer reviews
              </span>
            </div>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 rounded-none border border-dashed border-neutral-200">
            <Info className="mx-auto h-7 w-7 text-neutral-400" />
            <h3 className="mt-4 text-xs font-bold text-neutral-900 uppercase tracking-widest">No Reviews Available</h3>
            <p className="mt-2 text-[11px] text-neutral-450 font-semibold uppercase tracking-wider">Be the first to share your comfort and sizing feedback on this model!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-neutral-50 rounded-none border border-neutral-200/40 p-6 flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Scorecard Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-none bg-neutral-950 text-white flex items-center justify-center text-[10px] font-black uppercase">
                      {review.user?.name ? review.user.name.substring(0, 2) : "AN"}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider leading-none">
                        {review.user?.name || "Anonymous Shopper"}
                      </h4>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                          <ShieldCheck className="h-3 w-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-neutral-400 tracking-wide font-mono">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 stroke-[2] ${
                        i < review.rating
                          ? "fill-amber-500 text-amber-500"
                          : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment details */}
                <div className="space-y-1">
                  {review.title && (
                    <h5 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                      "{review.title}"
                    </h5>
                  )}
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {review.comment || "No comment details provided."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
