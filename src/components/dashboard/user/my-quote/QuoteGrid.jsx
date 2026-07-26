"use client";

import QuoteCard from "./QuoteCard";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuoteGrid({
  quote,
  isLoading,
  view,
  onResetFilters,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1">
        <Skeleton className="h-64 rounded-2xl bg-muted border border-border" />
      </div>
    );
  }

  if (!quote) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="grid grid-cols-1">
      <QuoteCard quote={quote} view={view} />
    </div>
  );
}
