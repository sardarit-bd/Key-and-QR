'use client';

/**
 * Scan History Loading Skeleton
 * Premium skeleton matching the collectible card shape.
 */
export default function ScanHistorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-white/6 bg-card light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55"
        >
          {/* Image area */}
          <div className="h-52 animate-pulse bg-muted sm:h-56">
            <div className="h-full w-full bg-gradient-to-r from-card via-muted/50 to-card animate-shimmer" />
          </div>

          {/* Body */}
          <div className="space-y-3 p-5">
            <div className="h-3.5 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-3.5 w-1/2 animate-pulse rounded-lg bg-muted" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 w-20 animate-pulse rounded-lg bg-muted" />
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
