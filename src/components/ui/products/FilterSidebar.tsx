"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, Check, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  brands: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  sizes: Array<{ id: string; name: string; value: string }>;
  onClose?: () => void;
}

export default function FilterSidebar({ brands, categories, sizes, onClose }: FilterSidebarProps) {
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

  // Price range input states
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync inputs with active query parameter
  useEffect(() => {
    if (currentPriceRange) {
      const [min, max] = currentPriceRange.split("-");
      setMinPrice(min === "0" ? "" : min || "");
      setMaxPrice(max === "9999" ? "" : max || "");
    } else {
      setMinPrice("");
      setMaxPrice("");
    }
  }, [currentPriceRange]);

  // Collapsible sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gender: true,
    category: true,
    size: true,
    brand: true,
    price: true,
    offers: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterClick = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (!minPrice && !maxPrice) {
      params.delete("priceRange");
    } else {
      const minVal = minPrice || "0";
      const maxVal = maxPrice || "9999";
      params.set("priceRange", `${minVal}-${maxVal}`);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePriceApply();
    }
  };

  const handleRemoveFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = 
    currentBrand || currentCategory || currentGender || currentSize || currentPriceRange || currentOnSale;

  // Compile active selections list
  const activeSelections: Array<{ key: string; label: string; displayValue: string }> = [];
  if (currentGender) {
    activeSelections.push({ key: "gender", label: "Gender", displayValue: currentGender.charAt(0).toUpperCase() + currentGender.slice(1) });
  }
  if (currentCategory) {
    const matched = categories.find(c => c.slug === currentCategory);
    activeSelections.push({ key: "category", label: "Product Category", displayValue: matched ? matched.name : currentCategory });
  }
  if (currentSize) {
    activeSelections.push({ key: "size", label: "Size", displayValue: currentSize.startsWith("US") ? currentSize : `EU ${currentSize}` });
  }
  if (currentBrand) {
    const matched = brands.find(b => b.slug === currentBrand);
    activeSelections.push({ key: "brand", label: "Brand", displayValue: matched ? matched.name : currentBrand });
  }
  if (currentPriceRange) {
    const [min, max] = currentPriceRange.split("-");
    const displayPrice = min === "0" ? `Under $${max}` : max === "9999" ? `$${min} & Above` : `$${min} - $${max}`;
    activeSelections.push({ key: "priceRange", label: "Price", displayValue: displayPrice });
  }
  if (currentOnSale) {
    activeSelections.push({ key: "onSale", label: "Offers", displayValue: "On Sale" });
  }

  return (
    <div className="w-full flex flex-col space-y-6 text-left select-none">
      
      {/* 1. YOUR SELECTION SECTION */}
      {hasActiveFilters && (
        <div className="w-full bg-white border border-neutral-200/70 p-5 rounded-none shadow-xs space-y-4">
          <div className="text-center border-b border-neutral-100 pb-3">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-900">
              Your Selection
            </h2>
          </div>

          <div className="flex flex-col space-y-2.5">
            {activeSelections.map((selection) => (
              <div 
                key={selection.key} 
                className="flex items-center justify-between text-xs text-neutral-400 font-semibold"
              >
                <span>
                  {selection.label}: <strong className="text-neutral-700 font-bold">{selection.displayValue}</strong>
                </span>
                <button
                  onClick={() => handleRemoveFilter(selection.key)}
                  className="p-1 -mr-1 text-neutral-350 hover:text-neutral-800 transition-colors cursor-pointer"
                  aria-label={`Remove filter for ${selection.label}`}
                >
                  <X className="h-3 w-3 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleClearAll}
              className="w-full h-11 bg-black text-white hover:bg-neutral-850 font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer flex items-center justify-center rounded-none"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* 2. FILTER BY CONTAINER */}
      <div className="w-full bg-white border border-neutral-200/70 p-5 rounded-none shadow-xs">
        <div className="text-center border-b border-neutral-100 pb-3 mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-900">
            Filter By:
          </h2>
        </div>

        <div className="flex flex-col space-y-6">

          {/* A. GENDER SECTION */}
          <div className="flex flex-col space-y-2.5">
            <button
              onClick={() => toggleSection("gender")}
              className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
            >
              <span>Gender</span>
              {openSections.gender ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {openSections.gender && (
              <div className="flex flex-col space-y-2 pt-1">
                {["MEN", "WOMEN", "KIDS"].map((gender) => {
                  const isSelected = currentGender === gender.toLowerCase();
                  return (
                    <button
                      key={gender}
                      onClick={() => handleFilterClick("gender", gender.toLowerCase())}
                      className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-1 cursor-pointer"
                    >
                      <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                        {gender.toLowerCase() === "kids" ? "Kids" : gender.toLowerCase() === "women" ? "Women" : "Men"}
                      </span>
                      <div className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-black border-black text-white"
                          : "border-neutral-200 bg-white hover:border-neutral-350"
                      }`}>
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* B. OFFERS (ON SALE) */}
          <div className="flex flex-col space-y-2.5 border-t border-neutral-100/60 pt-4">
            <button
              onClick={() => toggleSection("offers")}
              className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
            >
              <span>Offers</span>
              {openSections.offers ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {openSections.offers && (
              <div className="flex flex-col space-y-2 pt-1">
                <button
                  onClick={() => handleFilterClick("onSale", "true")}
                  className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-1 cursor-pointer"
                >
                  <span className={currentOnSale ? "text-neutral-950 font-black" : ""}>
                    On Sale Only
                  </span>
                  <div className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                    currentOnSale
                      ? "bg-black border-black text-white"
                      : "border-neutral-200 bg-white hover:border-neutral-350"
                  }`}>
                    {currentOnSale && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* C. PRODUCT CATEGORY */}
          {categories.length > 0 && (
            <div className="flex flex-col space-y-2.5 border-t border-neutral-100/60 pt-4">
              <button
                onClick={() => toggleSection("category")}
                className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>Product Category</span>
                {openSections.category ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {openSections.category && (
                <div className="flex flex-col space-y-2 pt-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isSelected = currentCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleFilterClick("category", cat.slug)}
                        className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-1 cursor-pointer"
                      >
                        <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                          {cat.name}
                        </span>
                        <div className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "border-neutral-200 bg-white hover:border-neutral-350"
                        }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* D. SIZE */}
          {sizes.length > 0 && (
            <div className="flex flex-col space-y-2.5 border-t border-neutral-100/60 pt-4">
              <button
                onClick={() => toggleSection("size")}
                className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>Size</span>
                {openSections.size ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {openSections.size && (
                <div className="flex flex-col space-y-2 pt-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
                  {sizes.map((size) => {
                    const isSelected = currentSize === size.name;
                    return (
                      <button
                        key={size.id}
                        onClick={() => handleFilterClick("size", size.name)}
                        className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-1 cursor-pointer"
                      >
                        <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                          {size.name.replace("US", "US ").trim()}
                        </span>
                        <div className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "border-neutral-200 bg-white hover:border-neutral-350"
                        }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* E. BRAND */}
          {brands.length > 0 && (
            <div className="flex flex-col space-y-2.5 border-t border-neutral-100/60 pt-4">
              <button
                onClick={() => toggleSection("brand")}
                className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
              >
                <span>Brand</span>
                {openSections.brand ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {openSections.brand && (
                <div className="flex flex-col space-y-2 pt-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
                  {brands.map((brand) => {
                    const isSelected = currentBrand === brand.slug;
                    return (
                      <button
                        key={brand.id}
                        onClick={() => handleFilterClick("brand", brand.slug)}
                        className="flex items-center justify-between text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider text-left py-1 cursor-pointer"
                      >
                        <span className={isSelected ? "text-neutral-950 font-black" : ""}>
                          {brand.name}
                        </span>
                        <div className={`h-4 w-4 shrink-0 rounded-xs border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "border-neutral-200 bg-white hover:border-neutral-350"
                        }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* F. PRICE INPUTS */}
          <div className="flex flex-col space-y-2.5 border-t border-neutral-100/60 pt-4">
            <button
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-neutral-900 cursor-pointer"
            >
              <span>Price</span>
              {openSections.price ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {openSections.price && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-[10px] font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                      className="w-full h-8 rounded-none border border-neutral-200 pl-6 pr-2 text-xs font-bold focus:outline-none focus:border-black text-neutral-700 bg-white"
                    />
                  </div>
                  <span className="text-neutral-400 font-bold">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-[10px] font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onKeyDown={handlePriceKeyDown}
                      className="w-full h-8 rounded-none border border-neutral-200 pl-6 pr-2 text-xs font-bold focus:outline-none focus:border-black text-neutral-700 bg-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePriceApply}
                  className="w-full h-8 bg-neutral-900 hover:bg-black text-white font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply Price
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
}

