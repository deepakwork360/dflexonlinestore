"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// High-fidelity social SVG icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 22c-.9 0-1.7-.5-2.2-1.3-.8-1.3-.4-3.3.6-5.8.5-1.2 1.3-3 2.1-4.7-.6-1.2-.9-2.7-.4-4.1.6-1.5 2-2.5 3.6-2.5 1.5 0 2.7.9 3.2 2.3.8 2.3-.5 5.3-2.2 5.3-.9 0-1.7-.6-1.7-1.4 0-1.3.9-3.2 2.1-5 .8-1.1.9-2.4.2-3.4-.6-.8-1.8-1.2-3.1-1.2-2.7 0-4.8 2.2-4.8 4.9 0 1.6.8 3.1 2.2 3.7.4.2.5.4.4.8-.1.4-.4 1.4-.5 1.7-.1.3-.3.4-.6.3-2.1-.9-3.4-3.2-3.4-5.6C1 5.9 5 2 10.1 2S19 6.1 19 11.2c0 5-3.3 8.8-7.7 8.8-1.5 0-3-.8-3.5-1.7-.6 2.3-1.4 5.3-2.2 6.8-.5.9-1.3 1.5-2.2 1.5z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to StepAhead Store!", {
      description: "You've successfully subscribed to our luxury sneaker newsletter.",
      position: "bottom-center",
    });
    setEmail("");
  };

  return (
    <footer className="w-full bg-[#1A1A1A] text-neutral-400 border-t border-neutral-800 mt-auto pt-16 pb-8 font-sans">
      
      {/* Main Grid Layout */}
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12 md:px-16 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-12 lg:gap-x-16 items-start">
          
          {/* Left Column: Branding, Socials, and Subscription */}
          <div className="md:col-span-6 space-y-7 flex flex-col items-start text-left">
            {/* DALAMO Brand Logo */}
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/skull9.png"
                  alt="StepAhead Logo"
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
              <span className="font-lilita text-4xl sm:text-5xl md:text-6xl tracking-tighter text-white italic inline-block transform skew-x-[-8deg] transition-all duration-300 group-hover:scale-102">
                StepAhead Store
              </span>
            </Link>

            {/* Social Links Outlined Circles */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-neutral-600 text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-neutral-600 text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer"
                aria-label="Pinterest"
              >
                <PinterestIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-neutral-600 text-neutral-300 hover:text-white hover:border-white transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>

            {/* Subscription Form */}
            <div className="space-y-3 w-full max-w-md">
              <h4 className="text-sm font-semibold tracking-wider text-white">
                Subscribe to Get 5% Off!
              </h4>
              <form onSubmit={handleSubscribe} className="flex flex-row items-stretch w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="flex-grow bg-[#222222] border border-neutral-700 text-white placeholder-neutral-500 pl-4 pr-3 py-2 text-xs font-normal rounded-none focus:outline-none focus:border-neutral-550 transition-all"
                />
                <button
                  type="submit"
                  className="bg-white text-black font-semibold text-xs tracking-wider uppercase px-6 py-2 border border-white hover:bg-neutral-200 transition-all rounded-none shrink-0 cursor-pointer"
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Dynamic Footer Links Columns */}
          <div className="md:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 w-full text-left">
            
            {/* Quick Links Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white">
                Quick Links
              </h3>
              <ul className="space-y-2 text-[12.5px] font-medium">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors duration-200 block py-0.5">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors duration-200 block py-0.5">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors duration-200 block py-0.5">
                    FAQ&#39;s
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:text-white transition-colors duration-200 block py-0.5">
                    Blogs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white">
                Customer Service
              </h3>
              <ul className="space-y-2 text-[12.5px] font-medium">
                <li>
                  <Link href="/account" className="hover:text-white transition-colors duration-200 block py-0.5">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="hover:text-white transition-colors duration-200 block py-0.5">
                    Track my Order
                  </Link>
                </li>
                <li>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px] font-bold block py-0.5 select-none">
                    PRO
                  </span>
                </li>
                <li>
                  <span className="text-neutral-550 hover:text-white transition-colors duration-200 block py-0.5 cursor-pointer">
                    Opt Out
                  </span>
                </li>
              </ul>
            </div>

            {/* Policies Column */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white">
                Policies
              </h3>
              <ul className="space-y-2 text-[12.5px] font-medium">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors duration-200 block py-0.5 cursor-pointer">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors duration-200 block py-0.5 cursor-pointer">
                    Private Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors duration-200 block py-0.5 cursor-pointer">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-white transition-colors duration-200 block py-0.5 cursor-pointer">
                    Return / Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Centered Copyright Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-800/40 text-center text-[11px] font-medium tracking-widest text-neutral-550">
          <span>&copy; 2025 StepAhead Store &bull; All Rights Reserved</span>
        </div>

      </div>

    </footer>
  );
}
