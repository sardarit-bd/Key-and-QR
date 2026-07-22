'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ScanHistoryCard from './ScanHistoryCard';
import ScanHistoryEmptyState from './ScanHistoryEmptyState';
import Pagination from '@/components/ui/Pagination';

/**
 * Scan History Grid
 */
export default function ScanHistoryGrid({
  history,
  loading = false,
  pagination,
  onPageChange,
  onViewDetail,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#121526] border border-white/5 rounded-2xl h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <ScanHistoryEmptyState />;
  }

  const { total, totalPages, page } = pagination;

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {history.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ScanHistoryCard
                item={item}
                onViewDetail={onViewDetail}
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