"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
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
  hasDelivered: boolean;
}

export default function ProductDetailView({ product, recommended, colorSiblings = [], hasDelivered }: ProductDetailViewProps) {
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
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [activeTab, setActiveTab] = useState<"details" | "specifications" | "shipping" | "questions">("details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showDeliveredWarning, setShowDeliveredWarning] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFiles, setReviewFiles] = useState<File[]>([]);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  const handleReviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (selected.length + reviewFiles.length > 5) {
        toast.error("You can upload a maximum of 5 images per review.");
        return;
      }
      setReviewFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeReviewFile = (indexToRemove: number) => {
    setReviewFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleWriteReviewClick = () => {
    if (!hasDelivered) {
      setShowDeliveredWarning(true);
      toast.error("You can only write a review for this sneaker after it has been purchased and successfully delivered to you.", {
        position: "top-center",
        duration: 5000,
      });
      return;
    }
    setShowReviewForm(!showReviewForm);
    setShowDeliveredWarning(false);
  };

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

      reviewFiles.forEach((file, index) => {
        data.append(`photo${index + 1}`, file);
      });

      await createReview(data);
      toast.success("Thank you! Your review has been submitted and published successfully.");
      
      // Reset form
      setReviewName("");
      setReviewEmail("");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setReviewFiles([]);
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
  const { items, addToCart, openDrawer } = useCart();
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

    // Check if the user already has the maximum available stock of this variant in their cart
    const existingCartItem = items.find((i) => i.variantId === item.variantId);
    if (existingCartItem && existingCartItem.quantity >= item.stock) {
      toast.error(`You already have the maximum available stock (${item.stock} items) of this size in your bag.`, {
        position: "top-center",
      });
      return;
    }

    addToCart(item);

    // Open Cart Drawer only if this variant is not already in the cart (first-time addition)
    if (!existingCartItem) {
      openDrawer();
    }

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

    // If not in cart or has room under stock cap, add it; otherwise proceed directly to checkout
    const existingCartItem = items.find((i) => i.variantId === item.variantId);
    if (!existingCartItem || existingCartItem.quantity < item.stock) {
      addToCart(item);
    }

    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    const primaryImg = product.images.find((img: any) => img.isPrimary)?.url || product.images[0]?.url;
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      brand: product.brand?.name ?? "Premium",
      image: primaryImg,
    });
    if (!isWishlisted) {
      toast.success(`Saved ${product.name} to your wishlist!`, {
        icon: <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />,
        position: "bottom-center",
      });
    } else {
      toast.success(`Removed ${product.name} from wishlist!`, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto bg-white px-4 sm:px-6 md:px-12 lg:px-16 py-8 relative text-neutral-900">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-black transition-colors capitalize">
          {product.gender.toLowerCase()}
        </Link>
        <span>•</span>
        <Link href={`/collections/${product.category?.slug || 'sneakers'}`} className="hover:text-black transition-colors capitalize">
          {product.category?.name || 'Sneakers'}
        </Link>
        <span>•</span>
        <span className="hover:text-black transition-colors cursor-pointer capitalize">
          {product.brand?.name || 'Brand'}
        </span>
        <span>•</span>
        <span className="text-neutral-900 truncate max-w-[250px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        
        {/* LEFT COLUMN: Vertical photo gallery + Main active photo */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4 items-start w-full">
          {/* Vertical Thumbnails List */}
          {galleryImages.length > 1 && (
            <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto w-full md:w-20 lg:w-24 shrink-0 py-2 md:py-0 scrollbar-none md:max-h-[800px]">
              {galleryImages.map((image, index) => {
                const isActive = activeImageIndex === index;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 overflow-hidden bg-[#FBFBFB] transition-all border ${
                      isActive
                        ? "border-black shadow-sm"
                        : "border-transparent hover:border-neutral-300 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Show product photo ${index + 1}`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `${product.name} photo ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Main Active Photo Frame (Dual-Image Side-by-Side on Desktop) */}
          <div className="flex-1 order-1 md:order-2 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 (Active) */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F5F5] group">
              {/* Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 items-start">
                {hasDiscount && (
                  <span className="inline-flex items-center bg-white px-2 py-1 text-[10px] font-bold text-red-600 uppercase tracking-widest shadow-sm">
                    Sale {discountPercent}%
                  </span>
                )}
              </div>

              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-450">
                  No product photo
                </div>
              )}
            </div>

            {/* Image 2 (Next Image) - Only visible on desktop if exists */}
            <div className="hidden md:block relative aspect-[4/5] w-full overflow-hidden bg-[#F5F5F5] group">
              {galleryImages.length > 1 ? (
                <Image
                  src={galleryImages[(activeImageIndex + 1) % galleryImages.length].url}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 768px) 0vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                />
              ) : activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={`${product.name} alternate view`}
                  fill
                  sizes="(max-width: 768px) 0vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105 cursor-zoom-in opacity-50"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-450">
                  No product photo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Besnard-Style Clean Details */}
        <div className="lg:col-span-4 flex flex-col justify-start text-left space-y-8">
          
          {/* Title and Rating */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-[28px] font-medium tracking-tight text-neutral-950 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-600">
              {product.reviewCount > 0 ? (
                <>
                  <span className="flex items-center gap-1 text-black">
                    <Star className="h-3 w-3 fill-black text-black" />
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{product.reviewCount} reviews</span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
              <span>•</span>
              <button className="flex items-center gap-1 hover:text-black transition-colors cursor-pointer">
                Q&A <span className="text-[9px]">❯</span>
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline gap-3 py-1">
            {hasDiscount && (
              <span className="text-base text-neutral-500 line-through font-medium">
                ${Number(comparePriceDisplay).toFixed(2)}
              </span>
            )}
            <span className={`text-xl font-bold tracking-tight ${hasDiscount ? 'text-red-600' : 'text-neutral-900'}`}>
              ${Number(priceDisplay).toFixed(2)}
            </span>
          </div>

          {/* Color Selection */}
          <div className="space-y-3 pt-2">
            <span className="text-sm text-neutral-600 block">
              Color: <span className="font-bold text-neutral-900">{product.color || "Standard"}</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
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
                      className={`relative w-14 h-14 overflow-hidden border transition-all bg-[#FBFBFB] flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? "border-black p-0.5"
                          : "border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100"
                      }`}
                      title={sibling.color || sibling.name}
                    >
                      {siblingImage ? (
                        <Image
                          src={siblingImage}
                          alt={sibling.color || sibling.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
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
                      className={`relative w-14 h-14 overflow-hidden border transition-all bg-[#FBFBFB] flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-black p-0.5"
                          : "border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100"
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-full border border-neutral-100"
                        style={{ backgroundColor: color.hex || "#cccccc" }}
                      />
                    </button>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Size Select list */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 block">
                Size: <span className="font-bold text-neutral-900">{colorVariants.find(v => v.sizeId === selectedSizeId)?.size.name || "Select"}</span>
              </span>
              <button className="text-[11px] font-medium text-neutral-500 hover:text-black border-b border-dotted border-neutral-400 hover:border-black transition-colors cursor-pointer">
                Size Guide
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-0 border border-neutral-200 bg-white">
              {colorVariants.map((v, idx) => {
                const isOutOfStock = v.stock <= 0;
                const isSelected = selectedSizeId === v.sizeId;
                const borderRight = (idx + 1) % 5 !== 0 ? "border-r border-neutral-200" : "";
                const borderBottom = idx < Math.floor(colorVariants.length / 5) * 5 ? "border-b border-neutral-200" : "";

                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSizeId(v.sizeId)}
                    className={`relative h-12 flex items-center justify-center transition-all duration-200 cursor-pointer select-none text-xs font-medium ${borderRight} ${borderBottom} ${
                      isSelected
                        ? "bg-neutral-900 text-white font-bold"
                        : isOutOfStock
                        ? "bg-[#F9F9F9] text-neutral-300 overflow-hidden"
                        : "bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="absolute w-full h-full text-neutral-200" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </div>
                    )}
                    <span className="relative z-10">{v.size.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Sizing Standard Badge */}
            <div className="flex items-center gap-2 bg-[#F5F5F5] py-3 px-4 text-xs font-medium text-neutral-700 mt-2">
              <Info className="h-4 w-4 text-neutral-500" />
              Sizing Standard
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-14 bg-[#1A1A1A] text-white hover:bg-black text-sm font-bold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to cart</span>
            </button>
            
            <button
              onClick={handleToggleWishlist}
              className={`h-14 w-14 shrink-0 border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                isWishlisted
                  ? "border-rose-500 bg-rose-50 text-rose-500"
                  : "border-neutral-300 bg-white text-neutral-500 hover:border-black hover:text-black"
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart className={`h-5 w-5 stroke-[1.5] ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
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

        </div>
      </div>

      {/* Tabbed Spec Sheets (Full Width Below Grid) */}
      <div className="mt-20 pt-10 border-t border-neutral-100">
        <div className="flex items-center gap-6 md:gap-10 border-b border-neutral-100 overflow-x-auto scrollbar-none pb-4">
          <button
            onClick={() => setActiveTab("specifications")}
            className={`text-sm md:text-base font-bold whitespace-nowrap transition-colors relative ${
              activeTab === "specifications" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`text-sm md:text-base font-bold whitespace-nowrap transition-colors relative ${
              activeTab === "details" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`text-sm md:text-base font-bold whitespace-nowrap transition-colors relative ${
              activeTab === "shipping" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Shipping & Returns
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`text-sm md:text-base font-bold whitespace-nowrap transition-colors relative ${
              activeTab === "questions" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            Questions & Answers
          </button>
        </div>

        <div className="py-10 text-sm text-neutral-600 leading-relaxed font-medium max-w-4xl">
          {activeTab === "specifications" && (
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-baseline gap-2 py-1">
                <span className="text-neutral-500 min-w-[120px]">Seller</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 mx-2"></span>
                <span className="text-neutral-900 font-bold text-right">{product.brand?.name || "PREMIUM BRAND"}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 py-1">
                <span className="text-neutral-500 min-w-[120px]">Article Number</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 mx-2"></span>
                <span className="text-neutral-900 font-bold font-mono text-right">{product.sku || "N/A"}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 py-1">
                <span className="text-neutral-500 min-w-[120px]">Gender</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 mx-2"></span>
                <span className="text-neutral-900 font-bold capitalize text-right">{product.gender.toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 py-1">
                <span className="text-neutral-500 min-w-[120px]">Color</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 mx-2"></span>
                <span className="text-neutral-900 font-bold uppercase text-right">{product.color || "STANDARD"}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2 py-1">
                <span className="text-neutral-500 min-w-[120px]">Category</span>
                <span className="flex-1 border-b border-dotted border-neutral-300 mx-2"></span>
                <span className="text-neutral-900 font-bold text-right">{product.category?.name || "Sneaker"}</span>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-4 text-left text-base">
              <p>{product.description}</p>
              <p>Step into next-level comfort with this high-precision design constructed from sustainable premium materials. Built to adapt beautifully to your natural stride while supporting high-impact street daily fashion aesthetics.</p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 text-left text-base">
              <p><strong>Fast Premium Delivery:</strong> Orders placed are compiled and shipped within 24-48 business hours. Delivery typically averages 3-5 standard business days.</p>
              <p><strong>Hassle-Free 30-Day Returns:</strong> We provide pre-paid return shipment labels. Try them comfortably in your home; if the sizing or style is not to your liking, return them within 30 days in original packaging for a 100% refund.</p>
            </div>
          )}
          
          {activeTab === "questions" && (
            <div className="space-y-4 text-left text-base">
              <p className="text-neutral-400 italic">No questions have been asked about this product yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {recommended && recommended.length > 0 && (
        <section className="mt-28 border-t border-neutral-100 pt-20">
          <div className="text-center pb-2 mb-14 flex justify-center">
            <h2 className="text-2xl md:text-3xl font-medium text-neutral-950">
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
      <section className="mt-20 border-t border-neutral-100 pt-16 text-left pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Reviews List */}
          <div className="flex-1 lg:w-[70%]">
            <h2 className="text-2xl font-medium text-neutral-950 mb-10">
              Reviews <span className="text-sm font-normal text-neutral-500 ml-2">{product.reviewCount} reviews</span>
            </h2>

            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="mb-12 border border-neutral-200 bg-[#FBFBFB] p-8 space-y-6 max-w-2xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Write a Review
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-neutral-400 hover:text-neutral-900 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Rating Stars Select */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-neutral-700">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2 text-black">
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
                              starVal <= reviewRating ? "fill-black text-black" : "text-neutral-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="E.g. Alexander McQueen"
                      className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="E.g. alex@luxury.com"
                      className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Review Title */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-700">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="E.g. Exceptional quality & comfort!"
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Review Comment */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-700">
                    Detailed Feedback (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience regarding comfort, materials, fit and sizing..."
                    rows={4}
                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* File Upload Input */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-neutral-700">
                    Attach Photos (Max 5)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-neutral-800 transition cursor-pointer select-none">
                      <Camera className="h-4 w-4 text-neutral-600" />
                      Upload Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleReviewFileChange}
                      />
                    </label>
                    <span className="text-xs text-neutral-500 font-medium">
                      {reviewFiles.length} of 5 selected
                    </span>
                  </div>

                  {/* Image Previews with Remove Buttons */}
                  {reviewFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {reviewFiles.map((file, idx) => {
                        const fileUrl = URL.createObjectURL(file);
                        return (
                          <div key={idx} className="relative h-20 w-20 group border border-neutral-200 bg-white shadow-sm overflow-hidden">
                            <img src={fileUrl} className="h-full w-full object-cover" alt="preview" />
                            <button
                              type="button"
                              onClick={() => removeReviewFile(idx)}
                              className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full p-0.5 transition cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-[#1A1A1A] text-white hover:bg-black py-4 text-sm font-bold uppercase tracking-widest transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}

            {product.reviews.length === 0 ? (
              <div className="text-center py-16">
                <Info className="mx-auto h-7 w-7 text-neutral-300" />
                <h3 className="mt-4 text-sm font-bold text-neutral-900">No Reviews Available</h3>
                <p className="mt-2 text-sm text-neutral-500">Be the first to share your comfort and sizing feedback on this model!</p>
              </div>
            ) : (
              <div className="space-y-10">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-neutral-100 pb-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-base font-bold text-neutral-900">
                          {review.user?.name || "Anonymous Shopper"}
                        </h4>
                        {review.verifiedPurchase && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#45853D] uppercase tracking-wide mt-1">
                            ✓ VERIFIED PURCHASER
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 text-black mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-black text-black"
                                  : "text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }).replace(/\//g, '.')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {review.title && <span className="font-bold mr-1">{review.title} -</span>}
                        {review.comment || "No comment details provided."}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-[#45853D] mt-4">
                        <div className="h-4 w-4 rounded-full bg-[#45853D] text-white flex items-center justify-center text-[10px]">✓</div>
                        Yes, I recommend this product
                      </div>

                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-3">
                          {review.images.map((imgUrl, imgIndex) => (
                            <button
                              key={imgIndex}
                              type="button"
                              onClick={() => setActiveLightboxImg(imgUrl)}
                              className="relative h-20 w-20 overflow-hidden border border-neutral-200 bg-white hover:border-black transition cursor-zoom-in"
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
                      
                      <div className="flex items-center justify-between pt-6 border-t border-neutral-50 mt-6">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                          Helpful?
                          <button className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition">
                            5 <span className="rotate-180 inline-block scale-y-[-1]">👍</span>
                          </button>
                          <button className="flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition">
                            1 <span>👎</span>
                          </button>
                        </div>
                        <button className="text-xs text-neutral-400 hover:text-black underline transition">
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Scorecard */}
          <div className="lg:w-[30%]">
            <div className="sticky top-10 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center flex flex-col items-center bg-white">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl font-bold text-neutral-900">{product.averageRating.toFixed(1)}</span>
                <div className="flex items-center text-black">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4.5 w-4.5 ${
                        i < Math.round(product.averageRating)
                          ? "fill-black text-black"
                          : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-neutral-500 mb-8 max-w-[200px] leading-relaxed">
                {product.reviewCount} out of {product.reviewCount} (100%) reviewers recommend this product
              </p>
              <button
                onClick={handleWriteReviewClick}
                className="w-full h-[52px] bg-[#222] text-white hover:bg-black text-sm font-medium transition-colors cursor-pointer"
              >
                {showReviewForm ? "Cancel Review" : "Write a Review"}
              </button>
            </div>
          </div>

        </div>
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
