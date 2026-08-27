"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * ShopSkeleton — premium loading skeleton mirroring the Shop page layout:
 * breadcrumb → banner → sidebar + toolbar → product grid → pagination.
 * No layout shift once real content loads.
 */
export default function ShopSkeleton() {
  return (
    <section className="bg-[#FDFBF6] text-[#2E2A24] pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-4">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-2 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
        </div>

        {/* Promotional banner */}
        <Skeleton className="mb-6 h-52 w-full rounded-2xl sm:h-60" />

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-5 rounded-2xl border border-[#EDE4D0]/80 bg-white/80 p-5">
              <Skeleton className="h-4 w-20 rounded" />
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))}
            </div>
          </aside>

          {/* Right column */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 space-y-4 border-b border-[#EDE4D0]/70 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Skeleton className="h-4 w-44 rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Skeleton className="h-10 w-full max-w-xs rounded-xl" />
                <Skeleton className="h-10 w-full max-w-[180px] rounded-xl" />
                <Skeleton className="h-10 w-full max-w-[180px] rounded-xl" />
              </div>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-[#EDE4D0]/80 bg-white"
                >
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 w-9 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
