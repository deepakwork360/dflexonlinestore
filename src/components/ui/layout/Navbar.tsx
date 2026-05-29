"use client";

import { HeartIcon, LucideShoppingCart, User2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

interface NavbarProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export default function Navbar({ isMenuOpen, onToggleMenu }: NavbarProps) {
  const { totalItems, openDrawer } = useCart();

  return (
    <header className="w-full bg-white dark:bg-neutral-950 px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 transition-all duration-300">
      
      {/* Left side: Hamburger on mobile, category nav on desktop */}
      <div className="flex items-center">
        {/* Animated Hamburger menu toggle */}
        <button
          onClick={onToggleMenu}
          className="flex md:hidden flex-col items-center justify-center gap-1.5 w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300 relative z-[10000] cursor-pointer"
          aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
        >
          <motion.div
            animate={isMenuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-5 h-0.5 bg-neutral-800 dark:bg-neutral-200"
          />
          <motion.div
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="w-5 h-0.5 bg-neutral-800 dark:bg-neutral-200"
          />
          <motion.div
            animate={isMenuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-5 h-0.5 bg-neutral-800 dark:bg-neutral-200"
          />
        </button>

        {/* Desktop Links (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/women"
            className="text-xs font-bold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
          >
            Women
          </Link>
          <Link
            href="/men"
            className="text-xs font-bold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
          >
            Men
          </Link>
          <Link
            href="/kids"
            className="text-xs font-bold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
          >
            Kids
          </Link>
        </nav>
      </div>

      {/* Brand Logo in the Center */}
      <Link href="/" className="group flex items-center">
        <span className="text-lg md:text-xl lg:text-2xl font-black tracking-[0.2em] text-black dark:text-white uppercase transition-all duration-300 group-hover:tracking-[0.25em]">
          Dflex Store
        </span>
      </Link>

      {/* Right side: Utilities icons (Profile, Wishlist, Cart) */}
      <div className="flex items-center gap-3.5 md:gap-5">
        <Link
          href="/account"
          className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
          aria-label="Account"
        >
          <User2 className="h-4.5 w-4.5 stroke-[2.2]" />
        </Link>
        <Link
          href="/wishlist"
          className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
          aria-label="Wishlist"
        >
          <HeartIcon className="h-4.5 w-4.5 stroke-[2.2]" />
        </Link>

        <button
          onClick={openDrawer}
          className="relative text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105 cursor-pointer"
          aria-label={`Shopping Cart${totalItems > 0 ? ` - ${totalItems} items` : ""}`}
        >
          <LucideShoppingCart className="h-4.5 w-4.5 stroke-[2.2]" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black dark:bg-white text-[8px] font-extrabold text-white dark:text-black leading-none">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

