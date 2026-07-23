'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanHistoryCard from './ScanHistoryCard';
import ScanHistoryEmptyState from './ScanHistoryEmptyState';
import Pagination from '@/components/ui/Pagination';

function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return 'Today';
  if (itemDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function groupByDate(items) {
  const groups = {};
  for (const item of items) {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (!groups[key]) {
      groups[key] = { date: key, label: getDateLabel(item.createdAt), items: [] };
    }
    groups[key].items.push(item);
  }
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Scan History Grid with date grouping
 * Spec Section 4.1: Today / Yesterday / Date headers
 */
export default function ScanHistoryGrid({
  history,
  loading = false,
  pagination,
  onPageChange,
  onViewDetail,
}) {
  const grouped = useMemo(() => groupByDate(history || []), [history]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#121526] border border-white/5 rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <ScanHistoryEmptyState />;
  }

  const { totalPages, page } = pagination;

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key="grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <h3 className="text-sm font-medium text-gray-400 mb-3 px-1">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item, index) => (
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
              </div>
            </div>
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
