'use client';

import { BookOpen, Sparkles } from 'lucide-react';

/**
 * My Quotes Header
 * Premium header with glowing collection icon — Overview icon-tile DNA.
 */
export default function MyQuoteHeader() {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      {/* Soft ambient glow behind the title block */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3.5">
          {/* Glowing icon tile */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5" />
            <div className="absolute inset-0 rounded-2xl border border-primary/25 shadow-[0_0_24px_-4px_rgba(168,85,247,0.25)] ring-1 ring-primary/20" />
            <BookOpen
              className="relative h-6 w-6 text-primary dark:text-violet-400"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground sm:text-3xl md:text-[34px]">
              My Quotes
            </h1>
            <p className="mt-1 text-sm text-foreground-tertiary">
              Your personal inspiration library
            </p>
          </div>
        </div>
      </div>

      {/* Premium glass badge */}
      <div className="group relative inline-flex shrink-0 cursor-default items-center gap-2 overflow-hidden rounded-full border border-primary/25 bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-2 text-[13px] font-medium text-primary shadow-[0_8px_24px_-8px_rgba(168,85,247,0.3)] backdrop-blur-md transition-all duration-300 dark:text-violet-300 light:text-primary">
        <Sparkles className="h-3.5 w-3.5 text-primary transition-transform duration-300 group-hover:rotate-12 dark:text-violet-400" />
        <span>Saved Collection</span>
      </div>
    </div>
  );
}
