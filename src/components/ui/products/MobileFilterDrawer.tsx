"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

interface MobileFilterDrawerProps {
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
}

export default function MobileFilterDrawer({
  brands,
  categories,
  sizes,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Compute number of active filters to display next to the button
  const activeFiltersCount = [
    searchParams.get("brand"),
    searchParams.get("category"),
    searchParams.get("gender"),
    searchParams.get("size"),
    searchParams.get("priceRange"),
    searchParams.get("onSale") === "true" ? "true" : null,
  ].filter(Boolean).length;

  return (
    <>
      {/* Filters Button (visible below desktop lg) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 border border-neutral-800 dark:border-neutral-200 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer ml-5"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 bg-rose-600 text-white rounded-full text-[9px] px-1.5 py-0.5 font-black leading-none">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Sidetab Drawer Portal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Slide-out Filters container */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-[9999] w-full max-w-[320px] bg-white dark:bg-neutral-950 p-6 shadow-2xl overflow-y-auto border-r border-neutral-200 dark:border-neutral-900 scrollbar-none"
            >
              <FilterSidebar
                brands={brands}
                categories={categories}
                sizes={sizes}
                onClose={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
