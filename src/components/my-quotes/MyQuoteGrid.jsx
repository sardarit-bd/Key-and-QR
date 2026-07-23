'use client';

import { motion, AnimatePresence } from 'framer-motion';
import MyQuoteCard from './MyQuoteCard';
import MyQuoteEmptyState from './MyQuoteEmptyState';
import Pagination from '@/components/ui/Pagination';

/**
 * My Quote Grid
 * Responsive grid with pagination
 */
export default function MyQuoteGrid({
  quotes,
  view = 'grid',
  loading = false,
  pagination,
  onPageChange,
  onRemove,
}) {
  if (loading) {
    return (
      <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'grid-cols-1 gap-4'}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#121526] border border-white/5 rounded-2xl h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return <MyQuoteEmptyState />;
  }

  const { total, totalPages, page } = pagination;

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
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'grid-cols-1 gap-4'
          }`}
        >
          {quotes.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MyQuoteCard
                favorite={item}
                view={view}
                onRemove={onRemove}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="mt-8">
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