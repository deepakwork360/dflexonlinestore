"use client";

import { useState, useMemo, useEffect } from "react";
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
  Camera,
  Maximize2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createReview } from "@/app/admin/actions";

interface ColorSibling {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  colorHex: string | null;
  images?: Array<{ url: string }>;
}

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
    color: string | null;
    colorHex: string | null;
    colorGroup: string | null;
    brand: { name: string; slug: string; logo: string | null } | null;
    category: { name: string; slug: string } | null;
    images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean; color?: string | null }>;
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
      images: string[];
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
  colorSiblings?: ColorSibling[];
}

export default function ProductDetailView({ product, recommended, colorSiblings = [] }: ProductDetailViewProps) {
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
    product.color || uniqueColors[0]?.name || ""
  );
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "specifications" | "shipping">("details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewEmail.trim()) {
      toast.error("Name and email are required to submit a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const data = new FormData();
      data.append("productId", product.id);
      data.append("name", reviewName);
      data.append("email", reviewEmail);
      data.append("rating", String(reviewRating));
      data.append("title", reviewTitle);
      data.append("comment", reviewComment);

      await createReview(data);
      toast.success("Thank you! Your review has been submitted and published successfully.");
      
      // Reset form
      setReviewName("");
      setReviewEmail("");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter variants belonging to selected color
  const colorVariants = useMemo(() => {
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  // Auto-select size if there is only one in-stock size available for the selected color
  useEffect(() => {
    const inStockVariants = colorVariants.filter((v) => v.stock > 0);
    if (inStockVariants.length === 1) {
      setSelectedSizeId(inStockVariants[0].sizeId);
    } else {
      setSelectedSizeId("");
    }
  }, [colorVariants]);

  // Find active variant (if size is selected)
  const activeVariant = useMemo(() => {
    return colorVariants.find((v) => v.sizeId === selectedSizeId);
  }, [colorVariants, selectedSizeId]);

  // Gallery supports up to 10 real product photos and is not filtered by variant color.
  const galleryImages = useMemo(() => {
    const primary = product.images.find((image) => image.isPrimary) || product.images[0];
    const rest = product.images.filter((image) => image.id !== primary?.id);
    return [...(primary ? [primary] : []), ...rest].slice(0, 10);
  }, [product.images]);

  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

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
      position: "bottom-center",
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
    <div className="mx-auto max-w-[1280px] w-full bg-white border border-neutral-200/80 rounded-[32px] shadow-sm p-6 sm:p-10 md:p-12 relative text-neutral-900">
      
      {/* Top Right Close button */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-800 transition-colors p-2 rounded-full hover:bg-neutral-50 cursor-pointer z-10"
        aria-label="Close page"
      >
        <X className="h-6 w-6 stroke-[1.5]" />
      </button>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[10px] font-extrabold text-neutral-400 mb-8 tracking-widest uppercase">
        <Link href="/" className="hover:text-[#B61C38] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-[#B61C38] transition-colors">
          {product.gender}
        </Link>
        <span>/</span>
        <span className="text-neutral-800 truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        
        {/* LEFT COLUMN: Vertical photo gallery + Main active photo */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-6 items-start">
          {/* Vertical Thumbnails List */}
          {galleryImages.length > 1 && (
            <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-x-visible w-full md:w-20 shrink-0 py-1.5 px-1 md:py-0 md:px-0 pb-2 md:pb-0 scrollbar-none">
              {galleryImages.map((image, index) => {
                const isActive = activeImageIndex === index;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 overflow-hidden rounded-xl border transition-all ${
                      isActive
                        ? "border-[#B61C38] ring-2 ring-[#B61C38]/10 scale-102 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-400"
                    }`}
                    aria-label={`Show product photo ${index + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} photo ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain object-center p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Active Photo Frame */}
          <div className="flex-1 order-1 md:order-2 w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-neutral-100 bg-[#FBFBFB] shadow-xs flex items-center justify-center p-6 group">
              {/* Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 items-center gap-1 rounded-md bg-neutral-900 px-2.5 text-[9px] font-bold uppercase tracking-widest text-white">
                  <Sparkles className="h-2.5 w-2.5 text-[#B61C38] fill-[#B61C38]" />
                  {product.gender}
                </span>
                {hasDiscount && (
                  <span className="inline-flex h-6 items-center rounded-md bg-[#B61C38] px-2.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                    Save {discountPercent}%
                  </span>
                )}
              </div>

              {activeImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={activeImage.url}
                    alt={activeImage.altText || product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="select-none object-contain object-center p-2 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-450">
                  No product photo
                </div>
              )}

              {/* Photos Counter */}
              <div className="absolute bottom-4 right-4 z-10 inline-flex h-7 items-center gap-1.5 rounded-lg bg-white/80 border border-neutral-200 px-2.5 text-[9px] font-bold uppercase tracking-wider text-neutral-800 backdrop-blur-md">
                <Camera className="h-3 w-3" />
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Besnard-Style Clean Details */}
        <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-6">
          
          {/* Brand releasing tag */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#B61C38] uppercase">
              {product.brand?.name || "Premium Release"}
            </span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-[11px] font-bold text-neutral-500">
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Title and SKU */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-neutral-450 uppercase tracking-widest">
                Category: {product.category?.name || "Lifestyle"}
              </span>
              {product.sku && (
                <span className="text-[11px] font-bold text-neutral-450 uppercase tracking-widest">
                  SKU: {product.sku}
                </span>
              )}
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline gap-4 py-2 border-y border-neutral-100">
            <span className="text-3xl font-black tracking-tight text-neutral-900">
              ${Number(priceDisplay).toFixed(2)}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-base text-neutral-400 line-through font-normal">
                  ${Number(comparePriceDisplay).toFixed(2)}
                </span>
                <span className="text-[9px] font-bold text-[#B61C38] bg-[#B61C38]/10 px-2 py-0.5 rounded-md border border-[#B61C38]/20">
                  Save ${Math.abs(Number(comparePriceDisplay) - Number(priceDisplay)).toFixed(0)}
                </span>
              </div>
            )}
          </div>

          {/* Color Selection (Sneaker thumbnail swatches) */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Color:
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {colorSiblings && colorSiblings.length > 0 ? (
                colorSiblings.map((sibling) => {
                  const isCurrent = sibling.slug === product.slug;
                  const siblingImage = sibling.images?.[0]?.url;
                  return (
                    <button
                      key={sibling.id}
                      type="button"
                      onClick={() => {
                        if (!isCurrent) {
                          router.push(`/products/${sibling.slug}`);
                        }
                      }}
                      className={`relative w-16 h-12 overflow-hidden rounded-lg border transition-all p-1 bg-white hover:scale-102 flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? "border-[#B61C38] ring-2 ring-[#B61C38]/10 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                      title={sibling.color || sibling.name}
                    >
                      {siblingImage ? (
                        <Image
                          src={siblingImage}
                          alt={sibling.color || sibling.name}
                          fill
                          sizes="64px"
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-md"
                          style={{ backgroundColor: sibling.colorHex || "#cccccc" }}
                        />
                      )}
                    </button>
                  );
                })
              ) : uniqueColors.length > 0 ? (
                uniqueColors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedSizeId("");
                      }}
                      className={`relative w-16 h-12 overflow-hidden rounded-lg border transition-all p-1 bg-white hover:scale-102 flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-[#B61C38] ring-2 ring-[#B61C38]/10 shadow-xs"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-full rounded-md border border-neutral-100"
                        style={{ backgroundColor: color.hex || "#cccccc" }}
                      />
                    </button>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Size Select list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Size (EUR):
              </span>
              <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest flex items-center gap-1">
                <Info className="h-3 w-3" /> US Sizes
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {colorVariants.map((v) => {
                const isOutOfStock = v.stock <= 0;
                const isSelected = selectedSizeId === v.sizeId;

                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSizeId(v.sizeId)}
                    className={`h-11 flex items-center justify-center border tracking-wider transition-all duration-200 cursor-pointer select-none rounded-lg text-xs font-bold ${
                      isSelected
                        ? "bg-neutral-900 border-neutral-900 text-white"
                        : isOutOfStock
                        ? "bg-neutral-50 border-neutral-100 text-neutral-300 line-through opacity-50 cursor-not-allowed"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-950 hover:bg-neutral-50"
                    }`}
                  >
                    {v.size.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper + Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              {/* Stepper counter */}
              <div className="flex items-center border border-neutral-200 rounded-lg bg-white h-12 px-2 shrink-0">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-2 text-neutral-405 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
                <span className="w-8 text-center text-xs font-bold select-none text-neutral-800">
                  {quantity}
                </span>
                <button
                  disabled={activeVariant && quantity >= activeVariant.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-neutral-405 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* BUY NOW Button */}
              <button
                onClick={handleBuyNow}
                className="flex-1 h-12 rounded-lg bg-[#B61C38] text-white hover:bg-[#9E142C] text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Buy Now</span>
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className={`h-12 w-12 rounded-lg border transition-all duration-350 active:scale-90 cursor-pointer flex items-center justify-center ${
                  isWishlisted
                    ? "border-rose-500 bg-rose-50 text-rose-500"
                    : "border-neutral-200 bg-white text-neutral-450 hover:text-rose-500 hover:border-rose-200"
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 stroke-[2] ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* ADD TO CART Button */}
            <button
              onClick={handleAddToCart}
              className="w-full h-12 inline-flex items-center justify-center rounded-lg border border-[#B61C38] text-[#B61C38] hover:bg-[#B61C38]/5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
            >
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Guarantees Row */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-neutral-100 text-left">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-neutral-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-neutral-800 uppercase tracking-wider">Free Delivery</span>
                <span className="text-[8px] text-neutral-400">Order $100+</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-neutral-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-neutral-800 uppercase tracking-wider">30 Day Returns</span>
                <span className="text-[8px] text-neutral-400">Easy label</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-neutral-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-neutral-800 uppercase tracking-wider">100% Authentic</span>
                <span className="text-[8px] text-neutral-400">Direct source</span>
              </div>
            </div>
          </div>

          {/* Tabbed Spec Sheets */}
          <div className="pt-2">
            <div className="flex border-b border-neutral-100">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-2 px-4 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors relative ${
                  activeTab === "details"
                    ? "text-[#B61C38]"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Description
                {activeTab === "details" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B61C38]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`py-2 px-4 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors relative ${
                  activeTab === "specifications"
                    ? "text-[#B61C38]"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Specifications
                {activeTab === "specifications" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B61C38]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`py-2 px-4 text-[10px] font-extrabold uppercase tracking-widest border-b-2 cursor-pointer transition-colors relative ${
                  activeTab === "shipping"
                    ? "text-[#B61C38]"
                    : "border-transparent text-neutral-400 hover:text-neutral-600"
                }`}
              >
                Shipping
                {activeTab === "shipping" && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B61C38]" />
                )}
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
        <section className="mt-28 border-t border-neutral-200/50 pt-20">
          <div className="text-center pb-2 mb-14 relative flex flex-col items-center select-none">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B61C38]">
              COMPLETE THE LOOK
            </span>
            <h2 className="text-2xl font-black uppercase tracking-widest text-neutral-950 mt-1.5 font-sans">
              You May Also Like
            </h2>
            <div className="w-12 h-[3px] bg-black mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {recommended.map((item) => {
              const primaryImg = item.images[0]?.url || "";
              const secondaryImg = item.images[1]?.url || null;
              const hasDiscount = item.compareAtPrice !== null;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((Number(item.compareAtPrice) - Number(item.price)) /
                      Number(item.compareAtPrice)) *
                      100
                  )
                : 0;

              return (
                <Link
                  key={item.id}
                  href={`/products/${item.slug}`}
                  className="group flex flex-col text-left relative overflow-hidden transition-all duration-300"
                >
                  {/* Luxury Product Frame with Hover Switching */}
                  <div className="aspect-[3/4] relative w-full overflow-hidden bg-[#FBFBFB] border border-neutral-200/40 group-hover:border-neutral-400 transition-all duration-500 rounded-none shadow-xs">
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 z-10 rounded-none bg-rose-600 px-2.5 py-0.5 text-[8.5px] font-black text-white uppercase tracking-widest shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}

                    <Image
                      src={primaryImg}
                      alt={item.name}
                      fill
                      sizes="(max-w-768px) 50vw, 25vw"
                      className="object-cover object-center transition-all duration-200 ease-out group-hover:scale-105"
                    />

                    {secondaryImg && (
                      <Image
                        src={secondaryImg}
                        alt={`${item.name} alternate view`}
                        fill
                        sizes="(max-w-768px) 50vw, 25vw"
                        className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-105"
                      />
                    )}

                    {/* Elite slide overlay on hover */}
                    <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-xs py-3 border-t border-neutral-150/40 translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-900 select-none">
                      Explore Details
                    </div>
                  </div>

                  {/* Curated Typography Metadata */}
                  <div className="mt-4 flex flex-col">
                    <span className="text-[9px] font-black tracking-[0.2em] text-[#B61C38] uppercase">
                      {item.brand?.name || "Premium Brand"}
                    </span>
                    <h3 className="mt-1 text-xs font-black uppercase tracking-wider text-neutral-900 line-clamp-1 group-hover:underline">
                      {item.name}
                    </h3>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-xs font-black text-neutral-950">
                        ${Number(item.price).toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-neutral-400 line-through font-semibold">
                          ${Number(item.compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
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
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="mt-3 inline-flex items-center gap-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-neutral-800 transition"
            >
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </button>
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

        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            className="mb-10 rounded-none border border-neutral-200 bg-neutral-50 p-6 space-y-6 max-w-xl shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Share Your Sizing & Comfort Feedback
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-neutral-450 hover:text-neutral-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Rating Stars Select */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-450">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReviewRating(starVal)}
                      className="p-0.5 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 stroke-[1.5] ${
                          starVal <= reviewRating ? "fill-amber-500 text-amber-500" : "text-neutral-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Identity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-450">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="E.g. Alexander McQueen"
                  className="w-full rounded-none border border-neutral-250 bg-white px-3 py-2 text-xs font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-450">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  placeholder="E.g. alex@luxury.com"
                  className="w-full rounded-none border border-neutral-250 bg-white px-3 py-2 text-xs font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-450">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="E.g. Exceptional leather quality & comfort!"
                className="w-full rounded-none border border-neutral-250 bg-white px-3 py-2 text-xs font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-450">
                Detailed Feedback (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience regarding comfort, materials, fit and sizing..."
                rows={4}
                className="w-full rounded-none border border-neutral-250 bg-white px-3 py-2 text-xs font-medium text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full rounded-none bg-black text-white hover:bg-neutral-800 py-3 text-xs font-extrabold uppercase tracking-widest transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

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
                      &quot;{review.title}&quot;
                    </h5>
                  )}
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    {review.comment || "No comment details provided."}
                  </p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {review.images.map((imgUrl, imgIndex) => (
                        <button
                          key={imgIndex}
                          type="button"
                          onClick={() => setActiveLightboxImg(imgUrl)}
                          className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-xs hover:border-neutral-800 transition cursor-zoom-in"
                        >
                          <img
                            src={imgUrl}
                            alt={`Review image ${imgIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Luxury Lightbox Overlay Modal */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xs cursor-zoom-out animate-fade-in"
        >
          <button
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-6 right-6 text-white hover:text-neutral-300 transition p-2 cursor-pointer"
            aria-label="Close photo preview"
          >
            <X className="h-7 w-7" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden">
            <img
              src={activeLightboxImg}
              alt="Review photo full preview"
              className="max-h-[85vh] max-w-[90vw] object-contain select-none shadow-2xl rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

    </div>
  );
}
