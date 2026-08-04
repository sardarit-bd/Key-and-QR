'use client';

import { History, PenLine, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Submission History — premium header hero.
 */
export default function SubmissionHistoryHeader() {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      {/* Soft ambient glow behind the title block */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-accent/[0.08] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3.5">
          {/* Glowing icon tile */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 rounded-2xl border border-primary/25 shadow-[0_0_24px_-4px_rgba(168,85,247,0.25)] ring-1 ring-primary/20" />
            <History
              className="relative h-6 w-6 text-primary dark:text-violet-300"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground sm:text-3xl md:text-[34px]">
              Submission History
            </h1>
            <p className="mt-1 text-sm text-foreground-tertiary">
              Every quote you&apos;ve shared, and its journey
            </p>
          </div>
        </div>
      </div>

      {/* Premium glass button — back to submit */}
      <Link href="/new-dashboard/user/submit-quote">
        <button
          type="button"
          className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-accent/25 bg-gradient-to-r from-accent/15 to-accent/5 px-4 py-2 text-[13px] font-medium text-accent shadow-[0_8px_24px_-8px_rgba(253,182,92,0.3)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.4)] active:translate-y-0 active:scale-[0.98]"
        >
          {/* Sheen sweep on hover */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <PenLine className="h-3.5 w-3.5 text-accent transition-transform duration-300 group-hover:rotate-12" />
          <span>Submit a Quote</span>
          <ArrowLeft className="h-3.5 w-3.5 text-accent/70 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </button>
      </Link>
    </div>
  );
}
