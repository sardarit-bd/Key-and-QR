'use client';

import { Heart, Sparkles } from 'lucide-react';

export default function FavoritesHeader({ total }) {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-rose-500/[0.07] blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5" />
            <div className="absolute inset-0 rounded-2xl border border-rose-500/25 shadow-[0_0_24px_-4px_rgba(251,113,133,0.25)] ring-1 ring-rose-500/20" />
            <Heart className="relative h-6 w-6 text-rose-400" fill="currentColor" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground sm:text-3xl md:text-[34px]">Favorites</h1>
            <p className="mt-1 text-sm text-foreground-tertiary">Your personal collection of saved inspiration</p>
          </div>
        </div>
      </div>
      <div className="group relative inline-flex shrink-0 cursor-default items-center gap-2 overflow-hidden rounded-full border border-rose-500/25 bg-gradient-to-r from-rose-500/15 to-rose-500/5 px-4 py-2 text-[13px] font-medium text-rose-500 shadow-[0_8px_24px_-8px_rgba(251,113,133,0.3)] backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-rose-400 transition-transform duration-300 group-hover:rotate-12" />
        <span>{total} Saved</span>
      </div>
    </div>
  );
}
