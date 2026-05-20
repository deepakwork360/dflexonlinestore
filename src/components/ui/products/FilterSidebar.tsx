"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, Check } from "lucide-react";

interface FilterSidebarProps {
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
}

export default function FilterSidebar({ brands, categories, sizes }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filter states from query params
  const currentBrand = searchParams.get("brand") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentGender = searchParams.get("gender") || "";
  const currentSize = searchParams.get("size") || "";
  const currentPriceRange = searchParams.get("priceRange") || "";
  const currentOnSale = searchParams.get("onSale") === "true";

  const handleFilterClick = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Replace (not push) with scroll:false to preserve scroll position and avoid history spam
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = 
    currentBrand || currentCategory || currentGender || currentSize || currentPriceRange || currentOnSale;

  const priceSegments = [
    { name: "Under $100", value: "0-100" },
    { name: "$100 - $150", value: "100-150" },
    { name: "$150 - $200", value: "100-200" }, // wait, standard segment: 150-200
    { name: "$150 - $200", value: "150-200" },
    { name: "$200 & Above", value: "200-9999" },
  ];

  // We filter duplicates for priceSegments since we have one duplicate there
  const uniquePriceSegments = [
    { name: "Under $100", value: "0-100" },
    { name: "$100 - $150", value: "100-150" },
    { name: "$150 - $200", value: "150-200" },
    { name: "$200 & Above", value: "200-9999" },
  ];

  return (
    <div className="w-full flex flex-col space-y-8 pr-0 lg:pr-6 text-left">
      
      {/* Sidebar Header & Clear Actions */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* 0. ON SALE TOGGLE */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Offers
        </h3>
        <button
          onClick={() => handleFilterClick("onSale", "true")}
          className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider py-2 px-3 border transition-all cursor-pointer ${
            currentOnSale
              ? "bg-rose-600 border-rose-600 text-white"
              : "bg-white border-neutral-200 text-neutral-600 hover:border-rose-400 hover:text-rose-600"
          }`}
        >
          <span>On Sale Only</span>
          {currentOnSale && <Check className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 1. GENDER FILTER */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Gender
        </h3>
        <div className="flex flex-col space-y-2">
          {["MEN", "WOMEN", "KIDS"].map((gender) => {
            const isSelected = currentGender === gender.toLowerCase();
            return (
              <button
                key={gender}
                onClick={() => handleFilterClick("gender", gender.toLowerCase())}
                className="flex items-center justify-between text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-0.5 cursor-pointer"
              >
                <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                  {gender}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BRANDS FILTER */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Brands
          </h3>
          <div className="flex flex-col space-y-2 max-h-[180px] overflow-y-auto pr-2 scrollbar-none">
            {brands.map((brand) => {
              const isSelected = currentBrand === brand.slug;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleFilterClick("brand", brand.slug)}
                  className="flex items-center justify-between text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-0.5 cursor-pointer"
                >
                  <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                    {brand.name}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CATEGORY FILTER */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Sneaker Styles
          </h3>
          <div className="flex flex-col space-y-2 max-h-[180px] overflow-y-auto pr-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterClick("category", cat.slug)}
                  className="flex items-center justify-between text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-0.5 cursor-pointer"
                >
                  <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                    {cat.name}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PRICE RANGES */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Price Range
        </h3>
        <div className="flex flex-col space-y-2">
          {uniquePriceSegments.map((price) => {
            const isSelected = currentPriceRange === price.value;
            return (
              <button
                key={price.value}
                onClick={() => handleFilterClick("priceRange", price.value)}
                className="flex items-center justify-between text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-0.5 cursor-pointer"
              >
                <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                  {price.name}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-black" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SIZES GRID */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Sneaker Sizes
          </h3>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {sizes.map((size) => {
              const isSelected = currentSize === size.name;
              return (
                <button
                  key={size.id}
                  onClick={() => handleFilterClick("size", size.name)}
                  className={`py-2 text-[10px] font-bold rounded-none border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400 bg-white"
                  }`}
                >
                  {size.name.replace("US", "").trim()}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
