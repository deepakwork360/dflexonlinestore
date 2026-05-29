"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CanceledPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 py-20">
      <div className="max-w-md w-full text-center space-y-7 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-none shadow-sm">
        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-wider text-black dark:text-white">
            Checkout Canceled
          </h1>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your transaction was not completed. Don't worry, your shopping bag is safe and your items are still waiting for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-black uppercase tracking-widest transition-all rounded-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Checkout
          </Link>
          
          <Link
            href="/women"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white text-xs font-black uppercase tracking-widest transition-all rounded-none"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            View Store
          </Link>
        </div>
      </div>
    </main>
  );
}
