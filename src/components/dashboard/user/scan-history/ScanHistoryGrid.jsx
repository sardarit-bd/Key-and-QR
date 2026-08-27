'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import ScanHistoryCard from './ScanHistoryCard';
import ScanHistoryEmptyState from './ScanHistoryEmptyState';
import ScanHistoryFilterEmptyState from './ScanHistoryFilterEmptyState';
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
 * Scan History Grid with date grouping
 * Timeline-style date rails + responsive 3/2/1 column grid.
 */
export default function ScanHistoryGrid({
  history,
  loading = false,
  pagination,
  onPageChange,
  onViewDetail,
  hasAnyHistory = false,
  hasFilters = false,
  onResetFilters,
}) {
  const grouped = useMemo(() => groupByDate(history || []), [history]);

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

  if (!history || history.length === 0) {
    // Distinguish "never scanned" from "filters matched nothing".
    if (hasAnyHistory && hasFilters) {
      return <ScanHistoryFilterEmptyState onReset={onResetFilters} />;
    }
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
          className="space-y-8"
        >
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Timeline date rail */}
              <div className="mb-4 flex items-center gap-3 px-1">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
                  <CalendarDays className="h-3 w-3 text-accent" />
                </span>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground-tertiary">
                  {group.label}
                </h3>
                <span className="h-px flex-1 bg-gradient-to-r from-accent/25 via-border to-transparent" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {group.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    custom={index}
                    initial="hidden"
                    animate="show"
                    variants={itemVariants}
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
