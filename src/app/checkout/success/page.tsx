import { Suspense } from "react";
import SuccessPageClient from "./SuccessPageClient";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 border-2 border-[#B61C38] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Confirming Payment Status...
          </p>
        </div>
      </main>
    }>
      <SuccessPageClient />
    </Suspense>
  );
}
