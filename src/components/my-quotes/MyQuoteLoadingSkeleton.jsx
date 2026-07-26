'use client';

/**
 * My Quote Loading Skeleton
 * Shimmer effect for loading state
 */
export default function MyQuoteLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          {/* Image skeleton */}
          <div className="h-48 bg-muted relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-card via-muted/30 to-card animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
          </div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded-lg animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded-lg animate-pulse w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 bg-muted rounded-lg animate-pulse w-20" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
