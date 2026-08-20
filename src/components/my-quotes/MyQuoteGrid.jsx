'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import MyQuoteCard from './MyQuoteCard';
import MyQuoteEmptyState from './MyQuoteEmptyState';
import Pagination from '@/components/ui/Pagination';

// Staggered entrance: gentle delay cascade (respects reduced motion globally).
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: (i % 3) * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

/**
 * My Quote Grid
 * Responsive grid with pagination.
 * Same premium spacing language as Scan History.
 */
export default function MyQuoteGrid({
  quotes,
  view = 'grid',
  loading = false,
  pagination,
  onPageChange,
  onToggleFavorite,
  isFiltered = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-72 overflow-hidden rounded-2xl border border-white/6 bg-card animate-pulse light:border-[#E8DFCE]/80"
          />
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
            <SearchX className="relative h-9 w-9 text-foreground-tertiary/60" />
          </div>
          <p className="text-foreground-secondary text-sm font-medium">
            No quotes match your search
          </p>
          <p className="text-foreground-tertiary text-xs mt-1.5 max-w-[240px]">
            Try a different keyword or clear your filters.
          </p>
        </div>
      );
    }
    return <MyQuoteEmptyState />;
  }

  const { totalPages, page } = pagination;

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`grid ${
            view === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6'
              : 'grid-cols-1 gap-4'
          }`}
        >
          {quotes.map((item, index) => (
            <motion.div
              key={item._id || index}
              custom={index}
              initial="hidden"
              animate="show"
              variants={itemVariants}
              className="w-full flex flex-col"
            >
              <MyQuoteCard
                receivedQuote={item}
                view={view}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
