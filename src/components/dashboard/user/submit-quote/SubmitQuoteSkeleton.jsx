'use client';

/**
 * SubmitQuoteSkeleton — Clean skeleton placeholder displayed during
 * eligibility/cooldown status verification. Prevents Flash of Unwanted Content (FOUC).
 */
export default function SubmitQuoteSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Textarea card skeleton */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/6 bg-card/60 p-5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.4)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-accent/15 border border-accent/20" />
            <div className="h-3.5 w-24 rounded-full bg-white/10 light:bg-black/10" />
          </div>
          <div className="h-3 w-20 rounded-full bg-white/5 light:bg-black/5" />
        </div>
        <div className="my-6 space-y-2.5">
          <div className="h-4 w-3/4 rounded-full bg-white/5 light:bg-black/5" />
          <div className="h-4 w-1/2 rounded-full bg-white/5 light:bg-black/5" />
        </div>
        <div className="mt-8 pt-4">
          <div className="h-1.5 w-full rounded-full bg-white/5 light:bg-black/5" />
        </div>
      </div>

      {/* Author input skeleton */}
      <div className="h-14 rounded-[18px] border border-white/6 bg-card/60 px-4 flex items-center gap-3 light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55">
        <div className="h-4 w-4 rounded-full bg-white/10 light:bg-black/10 shrink-0" />
        <div className="h-3.5 w-48 rounded-full bg-white/5 light:bg-black/5" />
      </div>

      {/* Category pills skeleton */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-accent/15 border border-accent/20" />
          <div className="h-3.5 w-20 rounded-full bg-white/10 light:bg-black/10" />
        </div>
        <div className="flex gap-2 overflow-hidden py-1">
          {[72, 88, 64, 80].map((w, i) => (
            <div
              key={i}
              style={{ width: `${w}px` }}
              className="h-8 rounded-full border border-white/6 bg-white/5 light:border-[#E8DFCE]/80 light:bg-black/5 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Limit notice skeleton */}
      <div className="h-12 rounded-xl border border-border/40 bg-card/30 flex items-center justify-center">
        <div className="h-3 w-64 rounded-full bg-white/5 light:bg-black/5" />
      </div>

      {/* Submit button skeleton */}
      <div className="flex justify-center pt-2">
        <div className="h-13 w-full sm:w-56 rounded-full bg-gradient-to-r from-accent/30 to-accent/20 border border-accent/25" />
      </div>
    </div>
  );
}
