"use client";

import { useState, useEffect } from "react";
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

      // Threshold to reset back to initial state at the top of the screen
      if (currentScrollY <= 20) {
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
        <CategoryNavigation />
      </div>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

