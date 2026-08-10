'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { SearchX } from 'lucide-react';

export function FavoritesEmptyState() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-14 text-center">
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-rose-500/25 bg-gradient-to-br from-rose-500/15 to-rose-500/5 shadow-[0_0_24px_-4px_rgba(251,113,133,0.25)]">
          <Heart className="h-11 w-11 text-rose-400" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-rose-500/10" />
      </div>
      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">No Saved Quotes Yet</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">
        Discover quotes through Inspire and save the ones that matter to you.
      </p>
      <Link href="/new-dashboard/user/my-quotes" className="inline-block">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(244,114,182,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(244,114,182,0.6)]">
          <Sparkles className="h-4 w-4" /> Discover Quotes
        </motion.button>
      </Link>
    </motion.div>
  );
}

export function FavoritesFilteredEmpty({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
        <SearchX className="relative h-9 w-9 text-foreground-tertiary/60" />
      </div>
      <p className="text-foreground-secondary text-sm font-medium">No matching saved quotes found</p>
      <p className="text-foreground-tertiary text-xs mt-1.5 max-w-[240px]">Try a different keyword or clear your filters.</p>
      {onReset && (
        <button onClick={onReset} className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-background-secondary/50 px-4 py-1.5 text-[12px] font-medium text-foreground-secondary transition-all duration-300 hover:border-accent/30 hover:text-foreground light:border-[#E8DFCE]/70 light:bg-white/70">
          Reset Filters
        </button>
      )}
    </div>
  );
}
