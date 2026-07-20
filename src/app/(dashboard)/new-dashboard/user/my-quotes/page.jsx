'use client';

import { motion } from 'framer-motion';
import {
  MyQuoteHeader,
  MyQuoteStats,
  MyQuoteFilters,
  MyQuoteGrid,
  MyQuoteLoadingSkeleton,
  MyQuoteErrorState,
  MyQuoteEmptyState,
} from '@/components/my-quotes';
import useMyQuotes from '@/hooks/my-quotes-service/useMyQuotes';

/**
 * My Quotes Page
 * Personal inspiration library
 * Route: /dashboard/my-quotes
 */
export default function MyQuotesPage() {
  const {
    quotes,
    loading,
    error,
    search,
    category,
    sort,
    view,
    pagination,
    stats,
    setSearch,
    setCategory,
    setSort,
    setView,
    handlePageChange,
    removeQuote,
    resetFilters,
    isAuthenticated,
  } = useMyQuotes();

  // Loading state
  if (loading && quotes.length === 0) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <MyQuoteHeader />
          <div className="mt-6">
            <MyQuoteLoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <MyQuoteHeader />
          <div className="mt-6">
            <MyQuoteErrorState error={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && quotes.length === 0) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <MyQuoteHeader />
          <div className="mt-6">
            <MyQuoteEmptyState />
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
      className="min-h-screen bg-[#090b14]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <MyQuoteHeader />

        {/* Stats */}
        <div className="mt-6">
          <MyQuoteStats stats={stats} />
        </div>

        {/* Filters */}
        <div className="mt-6">
          <MyQuoteFilters
            search={search}
            category={category}
            sort={sort}
            view={view}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onViewChange={setView}
            onReset={resetFilters}
          />
        </div>

        {/* Grid */}
        <div className="mt-6">
          <MyQuoteGrid
            quotes={quotes}
            view={view}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRemove={removeQuote}
          />
        </div>
      </div>
    </motion.div>
  );
}