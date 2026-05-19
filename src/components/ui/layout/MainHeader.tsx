"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import CategoryNavigation from "./CategoryNavigation";

export default function MainHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

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
  }, [lastScrollY]);

  return (
    <div
      className={`sticky top-0 z-50 w-full transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Navbar />
      <CategoryNavigation />
    </div>
  );
}
