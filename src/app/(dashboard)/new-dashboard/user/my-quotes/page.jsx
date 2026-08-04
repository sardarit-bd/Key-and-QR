'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  useMyQuotesList,
  useMyQuoteStats,
  useToggleQuoteFavorite,
} from '@/hooks/my-quotes-service/useMyQuotes';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';

const MY_QUOTES_PER_PAGE = 12;

/**
 * My Quotes Page
 * Personal inspiration library — ALL received quotes, backend-paginated.
 * Route: /new-dashboard/user/my-quotes
 */
export default function MyQuotesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);

  const { data: quoteCategories = [] } = useQuoteCategories();
  const toggleFavorite = useToggleQuoteFavorite();

  // Resolve the selected category to a backend ObjectId for server-side filtering.
  const selectedCategoryId =
    category !== 'all'
      ? quoteCategories.find(
          (cat) => (cat.slug || cat.id) === category
        )?._id || ''
      : '';

  // Reset to page 1 whenever filters/search change.
  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  // When searching, fetch a large page (backend history endpoint has no
  // search param) and filter client-side across the whole library so
  // search is not limited to the current page. Pagination stays server-driven
  // in the default (non-searching) case.
  const effectiveLimit = search ? 100 : MY_QUOTES_PER_PAGE;

  const { data, isLoading, isError, error } = useMyQuotesList({
    page: search ? 1 : page,
    limit: effectiveLimit,
    category: selectedCategoryId,
  });
  const { data: stats } = useMyQuoteStats();

  const quoteList = data?.data || [];
  const meta = data?.meta || { page, limit: effectiveLimit, total: 0, totalPage: 0 };
  const pagination = {
    page: meta.page || page,
    limit: meta.limit || effectiveLimit,
    total: meta.total || 0,
    totalPages: meta.totalPage || 0,
  };

  // Client-side sort + search across the fetched library (the backend history
  // endpoint has no search/sort params — pagination stays server-driven).
  const filteredQuotes = quoteList
    .filter((item) => {
      if (!search) return true;
      const text = `${item.quote?.text || ''} ${item.quote?.author || ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === 'oldest') return new Date(a.receivedAt) - new Date(b.receivedAt);
      if (sort === 'alphabetical')
        return (a.quote?.text || '').localeCompare(b.quote?.text || '');
      return new Date(b.receivedAt) - new Date(a.receivedAt);
    });

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleReset = useCallback(() => {
    setSearch('');
    setCategory('all');
    setSort('newest');
  }, []);

  // Loading state (first load only)
  if (isLoading && quoteList.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <MyQuoteHeader />
          <div className="mt-6">
            <MyQuoteErrorState
              error={error?.message || 'Failed to load your quotes. Please try again.'}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    );
  }

  // Empty state — only when the library is truly empty (and not searching)
  if (!isLoading && !search && pagination.total === 0) {
    return (
      <div className="min-h-screen bg-background">
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
      className="min-h-screen bg-background"
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
            categories={quoteCategories}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onViewChange={setView}
            onReset={handleReset}
          />
        </div>

        {/* Grid */}
        <div className="mt-6">
          <MyQuoteGrid
            quotes={filteredQuotes}
            view={view}
            loading={isLoading}
            pagination={search ? { ...pagination, totalPages: 1 } : pagination}
            onPageChange={handlePageChange}
            onToggleFavorite={toggleFavorite}
            isFiltered={Boolean(search) || category !== 'all'}
          />
        </div>
      </div>
    </motion.div>
  );
}
