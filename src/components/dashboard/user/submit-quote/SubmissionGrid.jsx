'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import SubmissionCard from './SubmissionCard';
import SubmissionEmptyState from './SubmissionEmptyState';
import Pagination from '@/components/ui/Pagination';

/**
 * Submission history grid — responsive cards + shared premium pagination.
 */
export default function SubmissionGrid({
  submissions,
  loading = false,
  pagination,
  onPageChange,
  isFiltered = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 overflow-hidden rounded-[22px] border border-white/6 bg-card animate-pulse light:border-[#E8DFCE]/80"
          />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
            <SearchX className="relative h-9 w-9 text-foreground-tertiary/60" />
          </div>
          <p className="text-foreground-secondary text-sm font-medium">
            No submissions match your filters
          </p>
          <p className="text-foreground-tertiary text-xs mt-1.5 max-w-[240px]">
            Try a different keyword, category, or status.
          </p>
        </div>
      );
    }
    return <SubmissionEmptyState />;
  }

  const { totalPages, page } = pagination;

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key="submissions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {submissions.map((item, index) => (
            <SubmissionCard key={item._id} submission={item} index={index} />
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
