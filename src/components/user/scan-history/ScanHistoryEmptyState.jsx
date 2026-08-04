'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scan, QrCode } from 'lucide-react';

/**
 * Scan History Empty State
 * Premium empty state with layered glow.
 */
export default function ScanHistoryEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-14 text-center"
    >
      {/* Glowing icon */}
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]">
          <QrCode className="h-11 w-11 text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-emerald-500/10" />
      </div>

      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">
        No Scan History Yet
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">
        Scan your first InspireTag to start building your inspiration journey.
        Every quote you discover will appear here.
      </p>

      <Link href="/" className="inline-block">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(52,211,153,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(52,211,153,0.6)]"
        >
          <Scan className="h-4 w-4" />
          Scan Your First Tag
        </motion.button>
      </Link>
    </motion.div>
  );
}
