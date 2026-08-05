'use client';

/**
 * ProfileSkeleton — premium loading skeleton for the Profile page.
 * Mirrors the Phase 1 page layout so the transition to loaded content
 * is smooth and consistent with the rest of the dashboard.
 */
export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5 animate-pulse">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-32 rounded-lg bg-muted" />
            <div className="h-3.5 w-48 rounded bg-muted/70" />
          </div>
          <div className="h-9 w-28 rounded-full bg-muted" />
        </div>

        {/* Profile header card */}
        <div className="rounded-[24px] border border-white/6 bg-card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 rounded-full bg-muted" />
            <div className="mt-5 h-6 w-40 rounded-lg bg-muted" />
            <div className="mt-2 h-3.5 w-56 rounded bg-muted/70" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-24 rounded-full bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-[22px] border border-white/6 bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted/60" />
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-3.5 w-24 rounded bg-muted/60" />
              <div className="h-3.5 w-32 rounded bg-muted/70" />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="rounded-[22px] border border-white/6 bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted/60" />
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-3.5 w-28 rounded bg-muted/60" />
              <div className="h-7 w-24 rounded-full bg-muted/70" />
            </div>
          ))}
        </div>

        {/* Subscription summary */}
        <div className="rounded-[22px] border border-white/6 bg-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted/60" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-background-secondary/40 p-4">
                <div className="h-3 w-20 rounded bg-muted/60" />
                <div className="mt-2.5 h-4 w-16 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
