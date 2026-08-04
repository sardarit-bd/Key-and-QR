'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PenLine, Sparkles } from 'lucide-react';

/**
 * Premium empty state for submission history.
 */
export default function SubmissionEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-14 text-center"
    >
      {/* Glowing icon */}
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-accent/25 bg-gradient-to-br from-accent/15 to-accent/5 shadow-[0_0_24px_-4px_rgba(253,182,92,0.25)]">
          <PenLine className="h-11 w-11 text-accent" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-accent/10" />
      </div>

      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">
        Inspire the world with your first quote
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">
        Every inspiring journey starts with a single word. Share your thoughts
        and let them brighten someone&apos;s day.
      </p>

      <Link href="/new-dashboard/user/submit-quote" className="inline-block">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent/85 px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_12px_32px_-8px_rgba(253,182,92,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(253,182,92,0.6)]"
        >
          <Sparkles className="h-4 w-4" />
          Submit Your First Quote
        </motion.button>
      </Link>
    </motion.div>
  );
}
