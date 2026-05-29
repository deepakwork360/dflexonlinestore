"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CategoryNavigation from "./CategoryNavigation";
import Sidebar from "./Sidebar";

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${
          isScrolled
            ? "px-4 pt-3 pb-2 bg-transparent"
            : "px-0 pt-0 pb-0 bg-white dark:bg-neutral-950"
        }`}
      >
        <div
          className={`w-full transition-all duration-500 ease-in-out ${
            isScrolled
              ? "rounded-2xl border border-white/30 dark:border-neutral-850/40 bg-white/45 dark:bg-neutral-950/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.06)]"
              : "rounded-none border-b border-neutral-100 dark:border-neutral-900 bg-white dark:bg-neutral-950"
          }`}
        >
          <Navbar isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        </div>

        {/* Category Navigation - collapses on scroll for a super clean floating capsule style */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-20 opacity-100"
          }`}
        >
          <CategoryNavigation />
        </div>
      </div>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
