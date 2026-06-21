"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Loader2,
  ImageOff,
  ArrowRight,
  User2,
  Heart,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Live debounced search effect for mobile
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Mobile live search request failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle suggestion click: close sidebar, reset query, redirect
  const handleSuggestionClick = (slug: string) => {
    onClose();
    setQuery("");
    router.push(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      setIsSearchFocused(false);
      router.push(`/collections/shoes?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Close drawer on path change
  useEffect(() => {
    onClose();
    setQuery("");
  }, [router]);

  // Click outside search container to close mobile search suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when sidebar drawer is open
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

  // Animations configuration
  const sidebarVariants = {
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        when: "afterChildren",
      },
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  } as const;

  const itemVariants = {
    closed: { opacity: 0, x: -16 },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  } as const;

  const menuItems = [
    { name: "New Arrivals", href: "/collections/new", isHighlight: false },
    { name: "Clothes", href: "/collections/clothes", isHighlight: false },
    { name: "Shoes", href: "/collections/shoes", isHighlight: false },
    { name: "Accessories", href: "/collections/accessories", isHighlight: false },
    { name: "Brands", href: "/collections/brands", isHighlight: false },
    { name: "Premium", href: "/collections/premium", isHighlight: false },
    { name: "Sale %", href: "/collections/sale?onSale=true", isHighlight: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Wrapper */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-0 left-0 bottom-0 z-[9999] flex h-dvh w-full max-w-[380px] flex-col bg-neutral-950 text-white shadow-[10px_0_50px_rgba(0,0,0,0.8)] border-r border-neutral-900/60 overflow-hidden"
          >
            {/* Header: Brand Name + Close Icon */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-900/50">
              <Link href="/" onClick={onClose} className="group flex items-center gap-2.5">
                <div className="relative w-11 h-11 shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/images/skull9.png"
                    alt="StepAhead Logo"
                    fill
                    sizes="44px"
                    className="object-contain"
                  />
                </div>
                <span className="font-lilita text-2xl sm:text-3xl tracking-tighter text-white italic inline-block transform skew-x-[-8deg] transition-all duration-300 group-hover:scale-102">
                  StepAhead Store
                </span>
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4 text-neutral-450" />
              </button>
            </div>

            {/* Mobile Debounced Live Search */}
            <div className="px-5 py-4 border-b border-neutral-900/50" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-neutral-500">
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
                  ) : (
                    <Search className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="SEARCH FOR SNEAKERS..."
                  className="w-full rounded-full border border-neutral-855 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-xs font-bold uppercase tracking-wider text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-750 focus:bg-neutral-900 focus:ring-1 focus:ring-rose-500/20 transition-all duration-200"
                />
                {query.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* Suggestions Container inside Sidebar */}
              {isSearchFocused && query.trim().length >= 2 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-900 bg-neutral-950 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="h-9 w-9 rounded bg-neutral-900" />
                          <div className="flex-1 space-y-1">
                            <div className="h-2.5 w-2/3 rounded bg-neutral-900" />
                            <div className="h-2 w-1/3 rounded bg-neutral-900" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-500 font-semibold">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 scrollbar-none">
                      {results.slice(0, 5).map((product) => {
                        const imgUrl = product.images[0]?.url;
                        return (
                          <button
                            type="button"
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.slug)}
                            className="w-full flex items-center gap-3 rounded-lg p-2 text-left hover:bg-white/[0.05] transition-colors"
                          >
                            <div className="relative h-9 w-9 overflow-hidden rounded bg-neutral-900 flex-shrink-0 border border-neutral-900">
                              {imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={product.name}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-500">
                                  <ImageOff className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-[8px] font-bold uppercase tracking-widest text-neutral-500">
                                {product.brand?.name}
                              </span>
                              <h4 className="text-xs font-bold text-neutral-250 truncate leading-snug">
                                {product.name}
                              </h4>
                            </div>
                            <span className="text-xs font-black text-neutral-100 flex-shrink-0">
                              ${Number(product.price).toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                      {/* Premium Pill style View All Results button inside Mobile suggestions panel */}
                      <div className="border-t border-neutral-900 pt-2 mt-2 px-1">
                        <Link
                          href={`/collections/shoes?q=${encodeURIComponent(query)}`}
                          onClick={() => {
                            setIsSearchFocused(false);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-2 py-2 w-full rounded-lg bg-neutral-900 hover:bg-neutral-855 border border-neutral-800 text-[10px] font-bold uppercase tracking-wider text-neutral-200 transition-colors"
                        >
                          View all results <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 scrollbar-none">
              
              {/* Gender High-Level Sections */}
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 block">
                  Select Department
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Women", href: "/women", bg: "bg-neutral-900" },
                    { label: "Men", href: "/men", bg: "bg-neutral-900" },
                    { label: "Kids", href: "/kids", bg: "bg-neutral-900" },
                  ].map((gender) => (
                    <motion.div key={gender.label} variants={itemVariants}>
                      <Link
                        href={gender.href}
                        onClick={onClose}
                        className="flex flex-col items-center justify-center py-4 rounded-xl border border-neutral-900/60 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-800 transition-all text-center cursor-pointer group"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors">
                          {gender.label}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Collections Navigation */}
              <div className="space-y-3.5">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 block">
                  Browse Shop
                </span>
                <nav className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <motion.div key={item.name} variants={itemVariants}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors ${
                          item.isHighlight
                            ? "text-rose-500 hover:text-rose-400"
                            : "text-neutral-350 hover:text-white"
                        }`}
                      >
                        <span>{item.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* User Utilities & Account links */}
              <div className="space-y-3 pt-4 border-t border-neutral-900/50">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-neutral-600 block">
                  Quick Access
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900/40 border border-neutral-900/80 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-900 transition-colors"
                    >
                      <User2 className="h-4 w-4" /> Account
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/wishlist"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900/40 border border-neutral-900/80 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:bg-neutral-900 transition-colors"
                    >
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                  </motion.div>
                </div>
              </div>

            </div>

            {/* Sidebar Footer */}
            <div className="px-6 py-6 bg-neutral-975 border-t border-neutral-900/80 space-y-4">
              {/* Premium Perks Info */}
              <div className="flex items-center gap-2 text-neutral-500">
                <ShoppingBag className="h-4 w-4 text-rose-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">
                  Secure Sneaker Deliveries
                </span>
              </div>
              
              <div className="flex items-center justify-between text-[9px] text-neutral-600 uppercase tracking-widest font-extrabold">
                <span>&copy; {new Date().getFullYear()} STEPAHEAD SNEAKERS</span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-neutral-500" /> FAQ
                </span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
