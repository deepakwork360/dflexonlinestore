"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productCompareAtPrice?: number | null;
  productBrand?: string;
  productImage: string;
  className?: string;
}

export default function WishlistButton({
  productId,
  productName,
  productSlug,
  productPrice,
  productCompareAtPrice,
  productBrand,
  productImage,
  className = "absolute top-3 right-3 z-20 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/90 hover:bg-white border border-neutral-200/50 shadow-sm hover:scale-105 active:scale-95 transition-all text-neutral-800 hover:text-[#B61C38] cursor-pointer focus:outline-none",
}: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const active = isInWishlist(productId);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop card redirection

    toggleWishlist({
      id: productId,
      name: productName,
      slug: productSlug,
      price: productPrice,
      compareAtPrice: productCompareAtPrice,
      brand: productBrand,
      image: productImage,
    });

    if (active) {
      toast.success(`Removed ${productName} from wishlist!`, { position: "bottom-center" });
    } else {
      toast.success(`Saved ${productName} to wishlist!`, { position: "bottom-center" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={className}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 ${
          active ? "text-[#B61C38] fill-[#B61C38] scale-110" : "text-neutral-500 hover:text-[#B61C38]"
        }`}
      />
    </button>
  );
}
