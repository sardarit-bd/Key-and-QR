'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * DataTablePagination Component
 * Unified, accessible, theme-consistent pagination for dashboard tables and lists.
 *
 * Supports:
 * - Page navigation with numbers and ellipsis
 * - Showing X-Y of Z items label
 * - Items per page selector dropdown
 * - Compact mode for narrow cards or modals
 * - Gold / amber active page brand theme
 */
export default function DataTablePagination({
  currentPage = 1,
  page,
  totalPages = 1,
  totalPage,
  totalItems,
  total,
  itemsPerPage = 10,
  limit,
  pageSize,
  onPageChange,
  onItemsPerPageChange,
  onLimitChange,
  onPageSizeChange,
  itemsPerPageOptions = [5, 10, 20, 50],
  label = 'items',
  showSinglePage = false,
  showTotalInfo = true,
  showItemsPerPage = true,
  compact = false,
  className = '',
}) {
  const activePage = Math.max(1, currentPage || page || 1);
  const totalPagesCount = Math.max(0, totalPages ?? totalPage ?? 0);
  const itemsCount = totalItems ?? total;
  const currentLimit = itemsPerPage ?? limit ?? pageSize ?? 10;
  const handlePageChange = onPageChange;
  const handleLimitChange = onItemsPerPageChange || onLimitChange || onPageSizeChange;

  const hasMultiplePages = totalPagesCount > 1;
  const hasItems = typeof itemsCount === 'number' && itemsCount > 0;

  // Don't render if there are no pages or if single page is suppressed
  if (totalPagesCount <= 0 && !hasItems) return null;
  if (totalPagesCount <= 1 && !showSinglePage && !hasItems) return null;

  // Calculate range
  const startRange = hasItems ? Math.min(itemsCount, (activePage - 1) * currentLimit + 1) : 0;
  const endRange = hasItems ? Math.min(itemsCount, activePage * currentLimit) : 0;

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    if (totalPagesCount <= 0) return [];
    const pages = [];
    const maxVisible = 5;

    if (totalPagesCount <= maxVisible) {
      for (let i = 1; i <= totalPagesCount; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, activePage - 1);
      let end = Math.min(totalPagesCount - 1, activePage + 1);

      if (start === 2 && end < 4) end = 4;
      if (end === totalPagesCount - 1 && start > totalPagesCount - 3) start = totalPagesCount - 3;

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPagesCount - 1) {
        pages.push('...');
      }

      if (totalPagesCount > 1) {
        pages.push(totalPagesCount);
      }
    }

    return pages;
  }, [totalPagesCount, activePage]);

  const handlePrevious = () => {
    if (activePage > 1) {
      handlePageChange?.(activePage - 1);
    }
  };

  const handleNext = () => {
    if (activePage < totalPagesCount) {
      handlePageChange?.(activePage + 1);
    }
  };

  // Compact mode or simple centered pagination
  if (compact || (!hasItems && !handleLimitChange)) {
    if (!hasMultiplePages && !showSinglePage) return null;

    return (
      <div className={`flex items-center justify-center gap-1.5 py-2 ${className}`}>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={activePage <= 1}
          className="h-8.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs select-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="h-8.5 w-7 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-xs select-none"
              >
                …
              </span>
            );
          }

          const isCurrent = activePage === p;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => handlePageChange?.(p)}
              className={`h-8.5 min-w-8.5 px-2.5 rounded-xl text-xs transition-all flex items-center justify-center select-none ${
                isCurrent
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold shadow-2xs'
                  : 'bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium cursor-pointer shadow-2xs'
              }`}
              aria-label={`Go to page ${p}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={handleNext}
          disabled={activePage >= totalPagesCount}
          className="h-8.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs select-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`pt-4 sm:pt-5 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm select-none ${className}`}
    >
      {/* Left: Result Range Info */}
      <div className="text-neutral-500 dark:text-neutral-400 font-medium order-2 sm:order-1 text-center sm:text-left">
        {showTotalInfo && hasItems ? (
          <>
            Showing{' '}
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold tabular-nums">
              {startRange}–{endRange}
            </span>{' '}
            of{' '}
            <span className="text-neutral-900 dark:text-neutral-100 font-semibold tabular-nums">
              {itemsCount}
            </span>{' '}
            {label}
          </>
        ) : (
          <span className="text-neutral-400 dark:text-neutral-500">
            Page {activePage} of {Math.max(1, totalPagesCount)}
          </span>
        )}
      </div>

      {/* Center: Page Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          disabled={activePage <= 1}
          onClick={handlePrevious}
          className="h-8.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((pNum, idx) => {
          if (pNum === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="h-8.5 w-6 flex items-center justify-center text-neutral-400 dark:text-neutral-500 text-xs font-medium"
              >
                …
              </span>
            );
          }

          const isCurrent = activePage === pNum;
          return (
            <button
              key={`page-${pNum}`}
              type="button"
              onClick={() => handlePageChange?.(pNum)}
              className={`h-8.5 min-w-8.5 px-2.5 rounded-xl text-xs transition-all flex items-center justify-center ${
                isCurrent
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold shadow-2xs'
                  : 'bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium cursor-pointer shadow-2xs'
              }`}
              aria-label={`Go to page ${pNum}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {pNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={activePage >= totalPagesCount}
          onClick={handleNext}
          className="h-8.5 px-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer shadow-2xs"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Items Per Page Dropdown */}
      <div className="flex items-center gap-2 shrink-0 order-3">
        {showItemsPerPage && handleLimitChange ? (
          <Select
            value={String(currentLimit)}
            onValueChange={(val) => {
              handleLimitChange(Number(val));
              handlePageChange?.(1);
            }}
          >
            <SelectTrigger className="h-8.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-2.5 min-w-[96px] shadow-2xs focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/40">
              <SelectValue placeholder={`Show ${currentLimit}`} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              side="top"
              align="end"
              sideOffset={4}
              className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xl z-50 py-1"
            >
              {itemsPerPageOptions.map((opt) => (
                <SelectItem
                  key={opt}
                  value={String(opt)}
                  className="text-xs rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-amber-500/10 focus:text-amber-800 dark:focus:text-amber-300"
                >
                  Show {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="w-0 sm:w-[96px]" />
        )}
      </div>
    </div>
  );
}
