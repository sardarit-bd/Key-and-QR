'use client';

/**
 * Premium Loading Skeleton
 */
export default function PremiumLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner skeleton */}
      <div className="h-32 bg-card border border-border rounded-2xl animate-pulse" />

      {/* Subscription status skeleton */}
      <div className="h-24 bg-card border border-border rounded-xl animate-pulse" />

      {/* Categories skeleton */}
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-card border border-border rounded-full animate-pulse" />
        ))}
      </div>

      {/* Quote skeleton */}
      <div className="h-64 bg-card border border-border rounded-2xl animate-pulse" />
    </div>
  );
}
