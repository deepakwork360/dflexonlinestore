"use client";

import { Search, Loader2, ImageOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function CategoryNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync state with URL parameter if it changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Derive gender from current pathname by splitting segments
  // e.g. /women → "women", /men → "men", /kids → "kids", anything else → null
  const GENDER_SEGMENTS = ["men", "women", "kids"];
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  const currentGender = GENDER_SEGMENTS.includes(firstSegment) ? firstSegment : null;

  const navItems = [
    { name: "New", href: "/collections/new", isHighlight: false },
    { name: "Clothes", href: "/collections/clothes", isHighlight: false },
    { name: "Shoes", href: "/collections/shoes", isHighlight: false },
    { name: "Accessories", href: "/collections/accessories", isHighlight: false },
    { name: "Brands", href: "/collections/brands", isHighlight: false },
    { name: "Premium", href: "/collections/premium", isHighlight: false },
    { name: "Sale%", href: currentGender ? `/collections/sale?gender=${currentGender}&onSale=true` : "/collections/sale?onSale=true", isHighlight: true },
  ];

  // Live debounced search effect
  useEffect(() => {
    if (!isFocused || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Live search request failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms optimal e-commerce debounce time

    return () => clearTimeout(delayDebounceFn);
  }, [query, isFocused]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard close listener (Esc)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSuggestionClick = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/products/${slug}`);
  };

  return (
    <div className="relative z-50 w-full bg-[#F6F6F6] transition-all duration-300">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex h-12 items-center justify-between gap-4">
          
          {/* Left Side: Category Links */}
          <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 md:overflow-visible">
            {navItems.map((item) => {
              const isMobileHidden = item.name === "Clothes" || item.name === "Accessories";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-200 ${
                    isMobileHidden ? "hidden sm:inline-block" : "inline-block"
                  } ${
                    item.isHighlight
                      ? "text-rose-600 font-semibold hover:text-rose-700"
                      : "text-black hover:text-neutral-600"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Stateful Debounced Live Search */}
          <div ref={dropdownRef} className="relative hidden sm:block w-64 md:w-80 mr-30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  setIsOpen(false);
                  setIsFocused(false);
                  router.push(`/collections/shoes?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              className="relative"
            >
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                ) : (
                  <Search className="h-4 w-4 text-neutral-500" />
                )}
              </span>
              <input
                type="text"
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  if (query.trim().length >= 2) setIsOpen(true);
                }}
                autoComplete="off"
                placeholder="Search sneakers..."
                className="w-full rounded-full border border-neutral-300 bg-white py-1.5 pl-10 pr-4 text-xs font-normal tracking-wide text-neutral-900 transition-all duration-300 placeholder-neutral-400 outline-none focus:border-neutral-600 focus:bg-white focus:ring-1 focus:ring-neutral-600"
              />
            </form>

            {/* Premium Suggestion Panel */}
            {isOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-80 md:w-96 rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {isLoading ? (
                  // Live loading skeletons
                  <div className="space-y-2.5 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="h-10 w-10 rounded-lg bg-neutral-900 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-3/4 rounded bg-neutral-900" />
                          <div className="h-2.5 w-1/2 rounded bg-neutral-900" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  // Zero state fallback
                  <div className="p-5 text-center">
                    <p className="text-xs font-bold text-neutral-500">
                      No sneakers found matching "{query}"
                    </p>
                  </div>
                ) : (
                  // Dynamic Live Matches
                  <div className="space-y-1 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-none">
                    <div className="px-3 py-1.5 text-[9px] font-bold tracking-[0.2em] text-neutral-500 uppercase border-b border-neutral-850 mb-2 flex items-center justify-between">
                      <span>Matched Sneakers</span>
                      <span className="text-[8px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full text-neutral-400 font-semibold">Live Suggest</span>
                    </div>
                    
                    {results.map((product) => {
                      const imgUrl = product.images[0]?.url;
                      const hasDiscount = product.compareAtPrice !== null;

                      return (
                        <button
                          key={product.id}
                          onClick={() => handleSuggestionClick(product.slug)}
                          className="group w-full flex items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.06] hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
                        >
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-neutral-900 flex-shrink-0 border border-neutral-800/80">
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-500">
                                <ImageOff className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500">
                              {product.brand?.name}
                            </span>
                            <h4 className="text-xs font-bold text-neutral-200 truncate mt-0.5 transition-colors group-hover:text-white">
                              {product.name}
                            </h4>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="block text-xs font-extrabold text-white">
                              ${Number(product.price).toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="block text-[9px] text-neutral-500 line-through">
                                ${Number(product.compareAtPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Centered Pill style View All Results button */}
                    <div className="border-t border-neutral-850 pt-2 mt-2 px-1">
                      <Link
                        href={`/collections/shoes?q=${encodeURIComponent(query)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 py-2 w-full rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-200 transition-all duration-200"
                      >
                        View all results <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}