"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const {
    items,
    totalItems,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    removeFromCart,
    updateQuantity,
  } = useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs cursor-pointer"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Shopping Cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 z-[1001] flex h-dvh w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-4 w-4 text-black stroke-[2]" />
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-black">
                  Your Bag
                </h2>
                {totalItems > 0 && (
                  <span className="text-[10px] font-bold bg-black text-white rounded-full px-2 py-0.5">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-20">
                  <ShoppingBag className="h-10 w-10 text-neutral-200" />
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-widest text-neutral-900">
                      Your bag is empty
                    </p>
                    <p className="mt-1 text-xs text-neutral-400 font-medium">
                      Add some sneakers to get started.
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 transition-all cursor-pointer"
                  >
                    Shop Now <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 pb-5 border-b border-neutral-100 last:border-0"
                  >
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeDrawer}
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
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {item.brand}
                      </p>
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeDrawer}
                        className="block text-xs font-bold text-neutral-900 mt-0.5 leading-snug hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-neutral-500 uppercase">
                          Size: {item.size}
                        </span>
                        {item.colorHex && (
                          <span
                            className="h-3 w-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: item.colorHex }}
                            title={item.color}
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Qty stepper */}
                        <div className="flex items-center border border-neutral-200 rounded-none">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-neutral-900 select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-2 py-1 text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-extrabold text-neutral-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer"
                            aria-label="Remove item"
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
            {items.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-5 space-y-4 bg-white">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Subtotal
                  </span>
                  <span className="text-base font-extrabold text-neutral-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-medium -mt-2">
                  Shipping &amp; taxes calculated at checkout.
                </p>

                {/* CTA Buttons */}
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="flex items-center justify-center gap-2 w-full rounded-none bg-black text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all hover:scale-[1.01] active:scale-95"
                >
                  Proceed to Checkout <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
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

