import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ApplicationsPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = useMemo((): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages - 1, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, 2, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  return (
    // 3-column layout: label left | page buttons center | arrows right
    <div className='border-brand-border flex items-center border-t px-5 py-4'>
      {/* Left: "Showing Page X of Y pages" */}
      <span className='text-secondary-text flex-1 text-sm'>
        Showing <span className='text-primary-text font-medium'>Page {currentPage}</span> of{" "}
        {totalPages} {totalPages === 1 ? "page" : "pages"}
      </span>

      {/* Center: page number buttons */}
      <div className='flex flex-1 items-center justify-center gap-1'>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className='text-secondary-text w-8 text-center text-sm'>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === p
                  ? "bg-app-foreground border-brand-border text-primary-text border shadow-sm"
                  : "text-secondary-text hover:text-primary-text hover:bg-brand-btn"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* Right: prev / next arrows */}
      <div className='flex flex-1 items-center justify-end gap-1'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='text-secondary-text hover:text-primary-text hover:bg-brand-btn rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30'
          aria-label='Previous page'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='text-secondary-text hover:text-primary-text hover:bg-brand-btn rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30'
          aria-label='Next page'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
