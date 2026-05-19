"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ImageConfig {
  src: string;
  position: string;
}

interface BannerProps {
  gender?: string;
}

const GENDER_IMAGES: Record<string, { images: ImageConfig[]; target: string }> = {
  men: {
    images: [
      { src: "/images/4.jpg", position: "50% 45%" },
      { src: "/images/3.jpg", position: "50% 40%" },
      { src: "/images/male.jpg", position: "50% 40%" },
    ],
    target: "men",
  },
  women: {
    images: [
      { src: "/images/2.jpg", position: "50% 40%" },
      { src: "/images/7.jpg", position: "50% 50%" },
       { src: "/images/1.jpg", position: "50% 50%" },
    ],
    target: "women",
  },
  kids: {
    images: [
        { src: "/images/kid2.jpg", position: "50% 22%" },
    ],
    target: "kids",
  },
};

const DEFAULT_BANNER = {
  images: [
    { src: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1600", position: "50% 40%" },
  ],
  target: "individuals",
};

export default function Banner({ gender }: BannerProps) {
  const genderKey = gender?.toLowerCase() || "";
  const config = GENDER_IMAGES[genderKey] || DEFAULT_BANNER;
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Instantly reset slider to primary index when active gender tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [genderKey]);

  // Slideshow interval timer (Changes every 30 seconds)
  useEffect(() => {
    if (config.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % config.images.length);
    }, 10000); // 10 seconds slideshow rotation

    return () => clearInterval(interval);
  }, [config.images.length, genderKey]);

  return (
    <section className="relative w-full h-[80vh] overflow-hidden bg-neutral-950">
      
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full">
        {config.images.map((img, idx) => (
          <div
            key={img.src + idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={img.src}
              alt={`Style Speaks First - ${config.target} collection slide ${idx + 1}`}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover select-none"
              style={{ objectPosition: img.position }}
            />
          </div>
        ))}
        
        {/* Sleek luxury gradient overlay to ensure perfect text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-20" />
      </div>

      {/* Content Layer (Left aligned matching high-end look) */}
      <div className="relative h-full w-full mx-auto px-6 sm:px-12 lg:px-20 flex items-center z-25">
        <div className="max-w-2xl text-left space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-left-5 duration-700">
          
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/20 px-3 py-1 text-[10px] font-bold text-rose-500 uppercase tracking-widest border border-rose-500/25">
            Premium Drop
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none font-sans">
            Style Speaks First
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-medium leading-relaxed max-w-lg">
            Clean lines, quality sneakers, and versatile designs created for{" "}
            <span className="text-white font-extrabold underline decoration-rose-500 decoration-2 underline-offset-4 uppercase tracking-wider">
              {config.target}
            </span>
            , who prefer subtle style with a premium feel.
          </p>

          <div className="pt-2">
            <Link
              href="/collections/shoes"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black shadow-lg transition-all duration-300 hover:bg-neutral-100 hover:scale-105 active:scale-95"
            >
              Explore Collection
            </Link>
          </div>

        </div>
      </div>

      {/* Slide Indicators (Bottom Right pagination dots) */}
      {config.images.length > 1 && (
        <div className="absolute bottom-6 right-8 z-30 flex items-center gap-2">
          {config.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}