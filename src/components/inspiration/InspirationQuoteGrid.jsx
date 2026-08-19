'use client';

import { useState } from 'react';
import { Search, LayoutGrid, List, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Pagination from '@/components/ui/Pagination';
import InspirationQuoteCard from './InspirationQuoteCard';

export default function InspirationQuoteGrid({
  quotes = [],
  isLoading = false,
  search = '',
  onSearchChange,
  sort = 'newest',
  onSortChange,
  emptyMessage = 'No inspiration found in this category yet.',
  page = 1,
  limit = 12,
  total = 0,
  onPageChange,
}) {
  const [view, setView] = useState('grid');

  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Search and Custom Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 dark:bg-card/40 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-border/80 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search quotes, authors, keywords..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background/80 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all shadow-sm"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Custom Select Sort Dropdown */}
          <Select value={sort} onValueChange={(val) => onSortChange && onSortChange(val)}>
            <SelectTrigger className="w-[145px] sm:w-[165px] h-10 rounded-xl bg-background/80 border-border text-xs sm:text-sm font-medium text-foreground cursor-pointer shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border bg-popover text-foreground shadow-xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex items-center rounded-xl border border-border p-0.5 bg-background/60">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('grid')}
              aria-label="Grid View"
              className={`h-9 w-9 rounded-lg cursor-pointer ${view === 'grid' ? 'bg-muted text-foreground' : 'text-foreground-tertiary hover:text-foreground'}`}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('list')}
              aria-label="List View"
              className={`h-9 w-9 rounded-lg cursor-pointer ${view === 'list' ? 'bg-muted text-foreground' : 'text-foreground-tertiary hover:text-foreground'}`}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl border border-border/50 bg-card/40 animate-pulse p-6 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-muted/60" />
                <div className="h-5 w-16 rounded-full bg-muted/60" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted/60" />
                <div className="h-4 w-4/5 rounded bg-muted/60" />
              </div>
              <div className="h-4 w-1/3 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      ) : quotes.length === 0 ? (
        /* Empty state */
        <div className="py-16 text-center bg-card/40 rounded-2xl border border-border/60 p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
            <Sparkles size={26} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {search ? 'No quotes matching your search' : 'No quotes found'}
          </h3>
          <p className="mt-1.5 text-sm text-foreground-tertiary max-w-md mx-auto">
            {search ? `No inspiration matching "${search}". Try searching for other keywords.` : emptyMessage}
          </p>
          {search && onSearchChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSearchChange('')}
              className="mt-4 rounded-xl cursor-pointer"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Quote Cards Grid / List */}
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5' : 'space-y-4'}>
            {quotes.map((quote) => (
              <InspirationQuoteCard key={quote._id} quote={quote} view={view} />
            ))}
          </div>

          {/* Pagination Controls & Summary */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
              <span className="text-xs sm:text-sm text-foreground-tertiary">
                Showing {startItem}–{endItem} of {total} {total === 1 ? 'quote' : 'quotes'}
              </span>

              {totalPages > 1 && onPageChange && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
