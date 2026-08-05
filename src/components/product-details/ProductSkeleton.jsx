"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductSkeleton — premium loading skeleton matching the page layout.
 */
export default function ProductSkeleton() {
  return (
    <section className="bg-[#FDFBF6] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-14">
          {/* Gallery skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          {/* Info skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
