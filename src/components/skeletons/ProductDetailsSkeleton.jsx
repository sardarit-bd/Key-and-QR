"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductDetailsSkeleton — premium skeleton matching the Product Details
 * layout: gallery + thumbnails | title/price/stock/purchase options/actions,
 * then feature highlights, product info, and related products.
 */
export default function ProductDetailsSkeleton() {
  return (
    <section className="bg-[#FDFBF6] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 py-4">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-2 rounded" />
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-3 w-2 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>

        {/* Product section */}
        <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Info + purchase */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-10 w-3/4 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-32 rounded" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full rounded" />
            </div>

            {/* Purchase options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>

            {/* Quantity + actions */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-12 w-36 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-24 rounded-xl" />
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>

            {/* Product info tabs */}
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>

        {/* Related products */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-[#EDE4D0]/80 bg-white">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
