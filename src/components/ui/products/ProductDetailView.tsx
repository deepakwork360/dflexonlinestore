"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ChevronDown,
  Info,
  BadgeAlert,
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
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
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
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "specifications" | "shipping">("details");

  // Filter variants belonging to selected color
  const colorVariants = useMemo(() => {
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  // Find active variant (if size is selected)
  const activeVariant = useMemo(() => {
    return colorVariants.find((v) => v.sizeId === selectedSizeId);
  }, [colorVariants, selectedSizeId]);

  // Gallery images (up to 5 photos)
  const galleryImages = useMemo(() => {
    // Collect all primary + alternative product images
    const list = [...product.images];
    // If we have less than 5 images, let's supplement them dynamically with clean details or alternative angles
    if (list.length < 5 && list.length > 0) {
      const baseImg = list[0].url;
      // We add secondary views with clean abstract parameters to populate the gallery beautifully
      const angles = ["&auto=format&fit=crop&w=800&q=80&fit=facearea", "&auto=format&fit=crop&w=800&q=80&sat=-50", "&auto=format&fit=crop&w=800&q=80&hue=290", "&auto=format&fit=crop&w=800&q=80&invert=1"];
      for (let i = list.length; i < 5; i++) {
        list.push({
          id: `virtual-${i}`,
          url: `${baseImg}${angles[i % angles.length]}`,
          altText: `${product.name} Alternative Angle View`,
          isPrimary: false,
        });
      }
    }
    return list.slice(0, 5);
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
  const handleAddToCart = () => {
    if (!selectedSizeId) {
      toast.error("Please select a sneaker size before adding to cart!", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    const sizeName = colorVariants.find((v) => v.sizeId === selectedSizeId)?.size.name;
    toast.success(`Added ${quantity}x ${product.name} (${selectedColor} - Size ${sizeName}) to your shopping cart!`, {
      icon: <ShoppingCart className="h-5 w-5 text-emerald-500" />,
      position: "top-center",
      duration: 4000,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSizeId) {
      toast.error("Please select a sneaker size to proceed directly to checkout!", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    handleAddToCart();
    // Simulate instant checkout path redirection
    toast.info("Initializing high-performance checkout gateway...");
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
    <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 sm:pt-12">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-8 tracking-wider uppercase">
        <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-black dark:hover:text-white transition-colors">
          {product.gender}
        </Link>
        <span>/</span>
        <span className="text-neutral-800 dark:text-neutral-300 font-bold truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* LEFT COLUMN: Premium Image Gallery (5 columns) */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          {/* Vertical Thumbnails (up to 5 photos) */}
          <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto max-h-[100px] md:max-h-[500px] lg:max-h-[550px] xl:max-h-[600px] p-1.5 md:p-2 scrollbar-none">
            {galleryImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIdx(i)}
                className={`relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-2 transition-all flex-shrink-0 cursor-pointer ${
                  activeImageIdx === i
                    ? "border-rose-500 shadow-md ring-2 ring-rose-500/20 scale-105"
                    : "border-neutral-200/50 dark:border-neutral-800 hover:border-neutral-400"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${product.name} thumbnail`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Primary Viewframe */}
          <div className="flex-1 order-1 md:order-2 relative h-[380px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 shadow-lg group">
            {/* Gender Pill Overlay */}
            <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
              <Sparkles className="h-3 w-3 text-rose-500 animate-pulse" />
              {product.gender}
            </span>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md">
                SAVE {discountPercent}%
              </span>
            )}

            <Image
              src={galleryImages[activeImageIdx]?.url}
              alt={galleryImages[activeImageIdx]?.altText || product.name}
              fill
              sizes="(max-w-1024px) 100vw, 55vw"
              priority
              className="object-cover object-center select-none transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Product Details & Interaction Deck (5 columns) */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-6 lg:py-2">
          
          {/* Brand & Stars Rating Scorecard */}
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center justify-center rounded-full bg-rose-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-rose-500 uppercase border border-rose-500/20">
              {product.brand?.name || "Premium Release"}
            </span>

            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 stroke-[2] ${
                        i < Math.round(product.averageRating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-neutral-300 dark:text-neutral-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  ⭐ {product.averageRating.toFixed(1)} ({product.reviewCount} Reviews)
                </span>
              </div>
            )}
          </div>

          {/* Product Headline Sizing */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
              {product.name}
            </h1>
            <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              Category: {product.category?.name || "Lifestyle"}
            </p>
          </div>

          {/* Price Layout */}
          <div className="flex items-baseline gap-4 py-1.5 border-b border-neutral-100 dark:border-neutral-900 pb-5">
            <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
              ${Number(priceDisplay).toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-lg text-neutral-400 line-through font-medium">
                  ${Number(comparePriceDisplay).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-rose-500 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/10">
                  Save ${Math.abs(Number(comparePriceDisplay) - Number(priceDisplay)).toFixed(0)}
                </span>
              </div>
            )}
          </div>

          {/* Color Swatch Selection */}
          {uniqueColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                  Select Color: <span className="text-neutral-800 dark:text-neutral-200">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedSizeId(""); // Reset size choice on color change
                    }}
                    className={`relative group h-9 px-4 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all duration-300 active:scale-95 cursor-pointer ${
                      selectedColor === color.name
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-neutral-200 dark:border-neutral-800 bg-white text-neutral-700 hover:border-neutral-400 dark:bg-neutral-950 dark:text-neutral-300"
                    }`}
                  >
                    {color.hex && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/10 dark:border-white/10"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Grid Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                Select Size: <span className="text-neutral-800 dark:text-neutral-200">{colorVariants.find((v) => v.sizeId === selectedSizeId)?.size.name || "None"}</span>
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                <Info className="h-3 w-3" /> System: US Sizes
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {colorVariants.map((v) => {
                const isOutOfStock = v.stock <= 0;
                const isLowStock = v.stock > 0 && v.stock <= 5;
                const isSelected = selectedSizeId === v.sizeId;

                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSizeId(v.sizeId)}
                    className={`relative py-3 rounded-xl border text-xs font-bold tracking-widest transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                      isSelected
                        ? "border-rose-500 bg-rose-500 text-white font-extrabold shadow-md ring-2 ring-rose-500/20"
                        : isOutOfStock
                        ? "border-neutral-100 dark:border-neutral-900 bg-neutral-50 text-neutral-300 dark:bg-neutral-900/30 dark:text-neutral-700 line-through cursor-not-allowed"
                        : "border-neutral-200 dark:border-neutral-800 bg-white text-neutral-850 hover:border-neutral-450 dark:bg-neutral-950 dark:text-neutral-300"
                    }`}
                  >
                    <span>{v.size.name}</span>
                    {isLowStock && !isSelected && (
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-tight block">
                        {v.stock} left
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Quantity + Action Deck */}
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <div className="flex items-center gap-4">
              
              {/* Stepper counter */}
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-full bg-neutral-50 dark:bg-neutral-900 shadow-inner px-2 py-1">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="h-4.5 w-4.5 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold select-none text-neutral-850 dark:text-neutral-150">
                  {quantity}
                </span>
                <button
                  disabled={activeVariant && quantity >= activeVariant.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Flex-1 Action Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 group inline-flex items-center justify-center gap-2.5 rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 py-3.5 text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4 stroke-[2.5]" />
                <span>Add to Shopping Cart</span>
              </button>

              {/* Wishlist Icon Action Button */}
              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-full border transition-all duration-300 active:scale-90 cursor-pointer shadow-md ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-500 text-white ring-4 ring-rose-500/10 scale-105"
                    : "border-neutral-200 bg-white text-neutral-700 hover:text-rose-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 stroke-[2] ${isWishlisted ? "fill-white" : ""}`} />
              </button>

            </div>

            {/* Direct Instant Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="w-full inline-flex items-center justify-center rounded-full border border-black text-black hover:bg-neutral-50 dark:border-white dark:text-white dark:hover:bg-white/5 py-3.5 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <span>Instant Buy Now</span>
            </button>
          </div>

          {/* Brand/Store Guarantees */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-900 text-left">
            <div className="flex flex-col space-y-1">
              <Truck className="h-5 w-5 text-rose-500" />
              <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Free Delivery
              </span>
              <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                Standard order $100+
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <RotateCcw className="h-5 w-5 text-rose-500" />
              <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                30 Day Returns
              </span>
              <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                Hassle-free labels
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <ShieldCheck className="h-5 w-5 text-rose-500" />
              <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                100% Authentic
              </span>
              <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                Direct brand source
              </span>
            </div>
          </div>

          {/* Premium Description Accordion / Tabs */}
          <div className="pt-6">
            {/* Tab navigation headers */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "details"
                    ? "border-rose-500 text-neutral-950 dark:text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "specifications"
                    ? "border-rose-500 text-neutral-950 dark:text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-widest border-b-2 cursor-pointer transition-colors ${
                  activeTab === "shipping"
                    ? "border-rose-500 text-neutral-950 dark:text-white"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Shipping & Returns
              </button>
            </div>

            {/* Tab contents */}
            <div className="py-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
              {activeTab === "details" && (
                <div className="space-y-2 text-left">
                  <p>{product.description}</p>
                  <p>Step into next-level comfort with this high-precision design constructed from sustainable premium materials. Built to adapt beautifully to your natural stride while supporting high-impact street daily fashion aesthetics.</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-2 text-left">
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-900">
                    <span className="font-bold text-neutral-800 dark:text-neutral-300">Model SKU:</span>
                    <span className="col-span-2 tracking-wide font-mono uppercase">{product.sku || "N/A"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-900">
                    <span className="font-bold text-neutral-800 dark:text-neutral-300">Release Brand:</span>
                    <span className="col-span-2">{product.brand?.name || "Premium Brand"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-900">
                    <span className="font-bold text-neutral-800 dark:text-neutral-300">Catalog Category:</span>
                    <span className="col-span-2">{product.category?.name || "Premium Sneaker"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-1.5">
                    <span className="font-bold text-neutral-800 dark:text-neutral-300">Gender Target:</span>
                    <span className="col-span-2 capitalize">{product.gender.toLowerCase()}</span>
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

      {/* CUSTOMER REVIEWS PORTAL SECTION */}
      <section className="mt-20 border-t border-neutral-100 dark:border-neutral-900 pt-16 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-6 mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-rose-500">
              Community Ratings
            </span>
            <h2 className="text-3xl font-extrabold uppercase text-neutral-900 dark:text-white tracking-tight mt-1 font-sans">
              Customer Reviews
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center md:text-right">
              <span className="text-3xl font-black text-neutral-900 dark:text-white">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-neutral-400 dark:text-neutral-500"> out of 5</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 stroke-[2] ${
                      i < Math.round(product.averageRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-neutral-300 dark:text-neutral-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                Based on {product.reviewCount} customer reviews
              </span>
            </div>
          </div>
        </div>

        {product.reviews.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <Info className="mx-auto h-7 w-7 text-neutral-400 dark:text-neutral-500" />
            <h3 className="mt-4 text-sm font-bold text-neutral-900 dark:text-white">No Reviews Available</h3>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">Be the first to share your comfort and sizing feedback on this model!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200/40 dark:border-neutral-800/60 p-6 flex flex-col space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Scorecard Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* User profile abbreviation */}
                    <div className="h-9 w-9 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white flex items-center justify-center text-xs font-black uppercase">
                      {review.user?.name ? review.user.name.substring(0, 2) : "AN"}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-950 dark:text-white uppercase leading-none">
                        {review.user?.name || "Anonymous Shopper"}
                      </h4>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-1">
                          <ShieldCheck className="h-3 w-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wide font-mono">
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
                          : "text-neutral-300 dark:text-neutral-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment details */}
                <div className="space-y-1">
                  {review.title && (
                    <h5 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-tight">
                      "{review.title}"
                    </h5>
                  )}
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
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
