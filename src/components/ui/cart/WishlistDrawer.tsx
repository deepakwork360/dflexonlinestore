"use client";

import { useWishlist } from "@/context/WishlistContext";
import { X, Heart, ArrowRight, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistDrawer() {
  const {
    wishlistItems,
    isWishlistOpen,
    closeWishlist,
    toggleWishlist,
  } = useWishlist();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isWishlistOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWishlist();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeWishlist]);

  return (
    <AnimatePresence>
      {isWishlistOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs cursor-pointer"
            onClick={closeWishlist}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 z-[1001] flex h-dvh w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-[#B61C38] fill-[#B61C38]" />
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-black">
                  Your Wishlist
                </h2>
                {wishlistItems.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#B61C38] text-white rounded-full px-2 py-0.5 animate-pulse">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeWishlist}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close wishlist"
              >
                <X className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {wishlistItems.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-20">
                  <Heart className="h-10 w-10 text-neutral-200" />
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-widest text-neutral-900">
                      Wishlist is empty
                    </p>
                    <p className="mt-1 text-xs text-neutral-400 font-medium">
                      Save your favorite releases here to view them later.
                    </p>
                  </div>
                  <button
                    onClick={closeWishlist}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-all cursor-pointer"
                  >
                    Explore Shoes <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-5 border-b border-neutral-100 last:border-0"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeWishlist}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/50"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          {item.brand || "Premium Brand"}
                        </p>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeWishlist}
                          className="block text-xs font-bold text-neutral-900 mt-0.5 leading-snug hover:underline line-clamp-2"
                        >
                          {item.name}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-extrabold text-neutral-900">
                          ${item.price.toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeWishlist}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest bg-neutral-100 text-neutral-800 hover:bg-black hover:text-white px-2.5 py-1.5 transition-all"
                          >
                            View <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="text-neutral-300 hover:text-rose-500 transition-colors p-1"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-5 bg-white space-y-3">
                <button
                  onClick={closeWishlist}
                  className="w-full text-center text-xs font-extrabold uppercase tracking-widest bg-black text-white py-3.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
