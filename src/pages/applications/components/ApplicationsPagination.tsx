import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ApplicationsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
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
    <div className='flex items-center px-5 py-4 border-t border-border-col'>
      {/* Left: "Showing Page X of Y pages" */}
      <span className='text-sm text-secondary-text flex-1'>
        Showing{" "}
        <span className='font-medium text-primary-text'>Page {currentPage}</span>{" "}
        of {totalPages} {totalPages === 1 ? "page" : "pages"}
      </span>

      {/* Center: page number buttons */}
      <div className='flex items-center gap-1 flex-1 justify-center'>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className='w-8 text-center text-sm text-secondary-text'>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === p
                  ? "bg-foreground border border-border-col text-primary-text shadow-sm"
                  : "text-secondary-text hover:text-primary-text hover:bg-button-col"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Right: prev / next arrows */}
      <div className='flex items-center gap-1 flex-1 justify-end'>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-1.5 rounded-md text-secondary-text hover:text-primary-text hover:bg-button-col disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          aria-label='Previous page'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-1.5 rounded-md text-secondary-text hover:text-primary-text hover:bg-button-col disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
          aria-label='Next page'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
