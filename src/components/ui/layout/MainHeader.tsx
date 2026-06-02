"use client";

import { useState, useEffect, Suspense } from "react";
import Navbar from "./Navbar";
import CategoryNavigation from "./CategoryNavigation";
import Sidebar from "./Sidebar";

export default function MainHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [revealedByScrollUp, setRevealedByScrollUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Do not hide the header if the mobile menu is open
      if (isMenuOpen) return;

      // Calculate banner height boundary threshold
      const isMobile = window.innerWidth < 768;
      const threshold = isMobile ? 320 : 600;

      // Keep navbar fully visible and unlocked when scrolling inside the banner
      if (currentScrollY <= threshold) {
        setIsVisible(true);
        setRevealedByScrollUp(false);
        setLastScrollY(currentScrollY);
        return;
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        if (!revealedByScrollUp) {
          setIsVisible(false);
        }
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal and lock visibility
        setIsVisible(true);
        setRevealedByScrollUp(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMenuOpen, revealedByScrollUp]);

  return (
    <>
      <div
        className={`sticky top-0 z-50 w-full transition-transform duration-500 ease-in-out ${
          isVisible || isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Navbar isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
        <Suspense fallback={<div className="h-12 bg-[#F6F6F6] w-full" />}>
          <CategoryNavigation />
        </Suspense>
      </div>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

