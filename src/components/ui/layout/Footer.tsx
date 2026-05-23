"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
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

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for joining our inner circle!", {
      description: "You've successfully subscribed to our luxury sneaker newsletter.",
      position: "bottom-right",
    });
    setEmail("");
  };

  return (
    <footer className="w-full bg-neutral-950 text-neutral-400 border-t border-neutral-900 mt-auto">
      {/* Newsletter / Club signup section */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-20 border-b border-neutral-900">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
              Exclusive Access
            </span>
            <h3 className="text-2xl sm:text-3xl font-light tracking-[0.06em] text-white uppercase font-sans">
              Join the <span className="font-extrabold text-neutral-300">Dflex Circle</span>
            </h3>
            <p className="max-w-md text-xs text-neutral-500 leading-relaxed">
              Subscribe to receive early release notifications, premium collaborations, and member-only styling editorials.
            </p>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubscribe} className="relative flex items-center w-full max-w-lg">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-neutral-600" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL ADDRESS"
                  required
                  className="w-full bg-neutral-900/50 border border-neutral-800 text-white placeholder-neutral-600 focus:placeholder-neutral-550 pl-11 pr-12 py-4 text-xs font-bold uppercase tracking-wider rounded-none focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="absolute right-0 h-full px-5 bg-white text-black hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center cursor-pointer group"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main columns section */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24">
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
          {/* Brand Introduction */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block group">
              <span className="text-2xl font-black tracking-[0.25em] text-white uppercase transition-all duration-300 group-hover:tracking-[0.3em]">
                Dflex Store
              </span>
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-neutral-500 font-medium">
              Curated precision streetwear and luxury sneaker releases. Merging absolute structural support, progressive material design, and high-impact aesthetics.
            </p>
            <div className="flex items-center gap-4.5 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all rounded-none border border-neutral-900 hover:border-neutral-800 cursor-pointer"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all rounded-none border border-neutral-900 hover:border-neutral-800 cursor-pointer"
                aria-label="Twitter"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all rounded-none border border-neutral-900 hover:border-neutral-800 cursor-pointer"
                aria-label="Pinterest"
              >
                <PinterestIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-450 block">
              Shop Collections
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link href="/women" className="hover:text-white transition-colors duration-200 uppercase tracking-wider block">
                  Women&#39;s Releases
                </Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-white transition-colors duration-200 uppercase tracking-wider block">
                  Men&#39;s Releases
                </Link>
              </li>
              <li>
                <Link href="/kids" className="hover:text-white transition-colors duration-200 uppercase tracking-wider block">
                  Kids&#39; Collections
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-white transition-colors duration-200 uppercase tracking-wider block">
                  Latest Drops
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Brand */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-450 block">
              Our Identity
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Our Chronicle
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Eco-Conscious
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Material Design
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Store Locator
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-450 block">
              Concierge Care
            </span>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Contact Support
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  Return Portal
                </span>
              </li>
              <li>
                <span className="text-neutral-600 uppercase tracking-wider block cursor-not-allowed">
                  F.A.Q.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Payment Row */}
      <div className="bg-black py-8 border-t border-neutral-900">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Dflex Store. All rights reserved.</span>
            <span className="hidden sm:inline text-neutral-800">|</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-neutral-400 transition-colors cursor-not-allowed">Privacy</span>
              <span className="hover:text-neutral-400 transition-colors cursor-not-allowed">Terms</span>
              <span className="hover:text-neutral-400 transition-colors cursor-not-allowed">Accessibility</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-600">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-extrabold text-neutral-400 tracking-[0.15em]">100% Secured Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
