"use client";

import QuoteCard from './QuoteCard';
import EmptyState from './EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuoteGrid({ quotes, isLoading, view, onResetFilters }) {
  if (isLoading) {
    return (
      <div className={`grid gap-3 md:gap-6 ${view === 'list' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl bg-[#121526] border border-white/5" />
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className={`grid gap-3 md:gap-6 ${view === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} view={view} />
      ))}
    </div>
  );
}