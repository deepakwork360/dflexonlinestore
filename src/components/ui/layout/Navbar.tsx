import { HeartIcon, LucideShoppingCart, User2 } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-white dark:bg-neutral-950 px-4 md:px-8 lg:px-12 py-4 flex items-center justify-between transition-all duration-300">
      
      {/* Left: Audience Links */}
      <nav className="flex items-center gap-6 md:gap-8">
        <Link 
          href="/women" 
          className="text-sm font-semibold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
        >
          Women
        </Link>
        <Link 
          href="/men" 
          className="text-sm font-semibold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
        >
          Men
        </Link>
        <Link 
          href="/kids" 
          className="text-sm font-semibold tracking-wider text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white uppercase transition-colors duration-200"
        >
          Kids
        </Link>
      </nav>

      {/* Center: Premium Brand Logo */}
      <Link href="/" className="group flex items-center">
        <span className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-widest text-black dark:text-white uppercase transition-all duration-300 group-hover:tracking-[0.2em]">
          Dflex Store
        </span>
      </Link>

      {/* Right: Interactive Navigation Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        <Link 
          href="/account" 
          className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
          aria-label="Account"
        >
          <User2 className="h-5 w-5 stroke-[2]" />
        </Link>
        <Link 
          href="/wishlist" 
          className="text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
          aria-label="Wishlist"
        >
          <HeartIcon className="h-5 w-5 stroke-[2]" />
        </Link>
        <Link 
          href="/cart" 
          className="relative text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white transition-all duration-200 hover:scale-105"
          aria-label="Shopping Cart"
        >
          <LucideShoppingCart className="h-5 w-5 stroke-[2]" />
        </Link>
      </div>

    </header>
  );
}