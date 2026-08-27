"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * CartSkeleton — premium skeleton mirroring the Cart page layout:
 * header + cart items (left) + sticky order summary (right).
 */
export default function CartSkeleton() {
  return (
    <section className="bg-[#FDFBF6] text-[#2E2A24] pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-44 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[#EDE4D0]/80 bg-white p-4"
              >
                <div className="flex flex-1 items-center gap-4 min-w-0">
                  <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-6 lg:sticky lg:top-8">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="mt-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
                <div className="flex justify-between border-t border-[#EDE4D0]/70 pt-4">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="mt-6 h-12 w-full rounded-xl" />
              <div className="mt-6 space-y-2.5 border-t border-[#EDE4D0]/70 pt-5">
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
