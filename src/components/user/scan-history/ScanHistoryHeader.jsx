'use client';

import Link from 'next/link';
import { Scan, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Scan History Header
 * Premium header with glowing scan icon and glass "Scan Journey" button.
 */
export default function ScanHistoryHeader() {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      {/* Soft ambient glow behind the title block */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3.5">
          {/* Glowing scan icon — Overview icon-tile DNA */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" />
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/25 shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)] ring-1 ring-emerald-500/20" />
            <Scan className="relative h-6 w-6 text-emerald-400" strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground sm:text-3xl md:text-[34px]">
              Scan History
            </h1>
            <p className="mt-1 text-sm text-foreground-tertiary">
              Every message you&apos;ve discovered through your journey
            </p>
          </div>
        </div>
      </div>

      {/* Premium glass button */}
      <Link href="/new-dashboard/user" className="inline-block">
        <button
          type="button"
          className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 px-4 py-2 text-[13px] font-medium text-emerald-600 shadow-[0_8px_24px_-8px_rgba(52,211,153,0.3)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-[0_12px_32px_-8px_rgba(52,211,153,0.4)] active:translate-y-0 active:scale-[0.98] light:text-emerald-700"
        >
          {/* Sheen sweep on hover */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <Sparkles className="h-3.5 w-3.5 text-emerald-500 transition-transform duration-300 group-hover:rotate-12 light:text-emerald-600" />
          <span>Scan Journey</span>
          <ArrowRight className="h-3.5 w-3.5 text-emerald-500/70 transition-transform duration-300 group-hover:translate-x-0.5 light:text-emerald-600/70" />
        </button>
      </Link>
    </div>
  );
}
