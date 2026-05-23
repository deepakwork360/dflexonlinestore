"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CategoryNavigation from "./CategoryNavigation";
import Sidebar from "./Sidebar";

export default function MainHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Do not hide the header if the mobile menu is open
      if (isMenuOpen) return;

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // Scrolling down past threshold -> hide with animation
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal with animation
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen]);

  return (
    <>
      <div
        className={`sticky top-0 z-50 w-full transition-transform duration-500 ease-in-out ${
          isVisible || isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Navbar isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        <CategoryNavigation />
      </div>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

