'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  SubmissionHistoryHeader,
  SubmissionFilters,
  SubmissionGrid,
} from '@/components/dashboard/user/submit-quote';
import { useSubmissionHistory } from '@/hooks/pending-quote/usePendingQuote';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';

const SUBMISSIONS_PER_PAGE = 12;

/**
 * Submission History Page
 * Every quote the user submitted, with status, filters, and backend pagination.
 * Route: /dashboard/user/submit-quote/history
 */
export default function SubmissionHistoryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever filters/search change.
  useEffect(() => {
    setPage(1);
  }, [search, category, status, sort]);

  const { data, isLoading, isError, error } = useSubmissionHistory({
    page,
    limit: SUBMISSIONS_PER_PAGE,
    search,
    category,
    status,
    sortBy: sort,
  });
  const { data: quoteCategories = [] } = useQuoteCategories();

  const submissions = data?.data || [];
  const meta = data?.meta || { page: 1, limit: SUBMISSIONS_PER_PAGE, total: 0, totalPage: 0 };
  const pagination = {
    page: meta.page || page,
    limit: meta.limit || SUBMISSIONS_PER_PAGE,
    total: meta.total || 0,
    totalPages: meta.totalPage || 0,
  };

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    // Keep scroll position near the list when changing pages.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleReset = useCallback(() => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setSort('newest');
  }, []);

  const hasActiveFilters = Boolean(search || category !== 'all' || status !== 'all' || sort !== 'newest');

  // Loading state (first load only)
  if (isLoading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <SubmissionHistoryHeader />
          <div className="mt-6">
            <SubmissionGrid loading />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <SubmissionHistoryHeader />
          <div className="mt-10 flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/15 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
              Oops! Something went wrong
            </h3>
            <p className="mt-2 max-w-sm text-sm text-foreground-tertiary">
              {error?.message || 'Failed to load your submissions. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 h-10 cursor-pointer rounded-xl border border-white/6 bg-muted px-5 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md light:border-[#E8DFCE]/80"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-28">
        {/* Header */}
        <SubmissionHistoryHeader />

        {/* Filters */}
        <div className="mt-5 sm:mt-6">
          <SubmissionFilters
            search={search}
            category={category}
            status={status}
            sort={sort}
            categories={quoteCategories}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
            onSortChange={setSort}
            onReset={handleReset}
          />
        </div>

        {/* Grid */}
        <div className="mt-5 sm:mt-6">
          <SubmissionGrid
            submissions={submissions}
            loading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            isFiltered={hasActiveFilters}
          />
        </div>
      </div>
    </motion.div>
  );
}
