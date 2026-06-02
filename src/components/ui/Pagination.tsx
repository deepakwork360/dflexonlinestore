"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1.5 py-10 w-full">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-neutral-900 hover:shadow active:scale-95 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50/50 text-neutral-300 cursor-not-allowed dark:border-neutral-800/50 dark:bg-neutral-950/50 dark:text-neutral-700">
          <ChevronLeft className="h-5 w-5" />
        </div>
      )}

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <div key={`ellipsis-${index}`} className="flex h-10 w-8 items-center justify-center text-neutral-400">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <Link
            key={`page-${page}`}
            href={createPageURL(page)}
            className={`flex h-10 min-w-[40px] px-3 items-center justify-center rounded-lg border text-sm font-bold transition-all active:scale-95 ${
              isCurrent
                ? "border-neutral-900 bg-neutral-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                : "border-neutral-200 bg-white text-neutral-600 shadow-sm hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 hover:shadow dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
            }`}
            aria-current={isCurrent ? "page" : undefined}
          >
            {page}
          </Link>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-neutral-900 hover:shadow active:scale-95 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
          aria-label="Next Page"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50/50 text-neutral-300 cursor-not-allowed dark:border-neutral-800/50 dark:bg-neutral-950/50 dark:text-neutral-700">
          <ChevronRight className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
