'use client';

import { motion } from 'framer-motion';
import { SearchX, RotateCcw } from 'lucide-react';

/**
 * Scan History Filter Empty State
 * Shown ONLY when the user HAS scan history but the current
 * search/filters return zero results. Offers a Reset action.
 */
export default function ScanHistoryFilterEmptyState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-14 text-center"
    >
      {/* Glowing icon */}
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/25 bg-gradient-to-br from-accent/15 to-accent/5 shadow-[0_0_24px_-4px_rgba(253,182,92,0.25)]">
          <SearchX className="h-11 w-11 text-accent" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">
        No matching results found
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">
        No scan history matches your current search or filters.
        Try adjusting your search terms or clearing the filters.
      </p>

      {onReset && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent shadow-[0_8px_24px_-8px_rgba(253,182,92,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/15 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.4)]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </motion.button>
      )}
    </motion.div>
  );
}
