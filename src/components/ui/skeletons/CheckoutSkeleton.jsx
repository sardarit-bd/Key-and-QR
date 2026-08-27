"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * CheckoutSkeleton — premium skeleton mirroring the Checkout page layout:
 * header + order summary (left) + billing/shipping form (right).
 */
export default function CheckoutSkeleton() {
  return (
    <section className="bg-[#FDFBF6] text-[#2E2A24] pb-16 sm:pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form (left) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-5 w-24 rounded" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-5 w-32 rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-11 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Gift / dropdown */}
            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-5 w-28 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>

            {/* Submit */}
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          {/* Order summary (right) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#EDE4D0]/80 bg-white p-6 lg:sticky lg:top-8">
              <Skeleton className="h-5 w-36 rounded" />
              <div className="mt-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-2/3 rounded" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2.5 border-t border-[#EDE4D0]/70 pt-5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
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
              <div className="mt-6 space-y-3 border-t border-[#EDE4D0]/70 pt-5">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
