'use client';

import { motion } from 'framer-motion';
import { ScanHistoryDetailModal, ScanHistoryEmptyState, ScanHistoryErrorState, ScanHistoryFilters, ScanHistoryGrid, ScanHistoryHeader, ScanHistorySkeleton, ScanHistoryStats } from '@/components/user/scan-history';
import useScanHistory from '@/hooks/scan-history/useScanHistory';


/**
 * Scan History Page
 * Route: /dashboard/scan-history
 */
export default function ScanHistoryPage() {
  const {
    history,
    loading,
    error,
    stats,
    search,
    category,
    sort,
    pagination,
    selectedItem,
    isModalOpen,
    setSearch,
    setCategory,
    setSort,
    handlePageChange,
    viewDetail,
    closeDetail,
    resetFilters,
    isAuthenticated,
  } = useScanHistory();

  // Loading state
  if (loading && history.length === 0) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <ScanHistoryHeader />
          <div className="mt-6">
            <ScanHistorySkeleton />
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
          <ScanHistoryHeader />
          <div className="mt-6">
            <ScanHistoryErrorState error={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && history.length === 0) {
    return (
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <ScanHistoryHeader />
          <div className="mt-6">
            <ScanHistoryStats stats={stats} loading={loading} />
          </div>
          <div className="mt-6">
            <ScanHistoryEmptyState />
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
        <ScanHistoryHeader />

        {/* Stats */}
        <div className="mt-6">
          <ScanHistoryStats stats={stats} loading={loading} />
        </div>

        {/* Filters */}
        <div className="mt-6">
          <ScanHistoryFilters
            search={search}
            category={category}
            sort={sort}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onSortChange={setSort}
            onReset={resetFilters}
          />
        </div>

        {/* Grid */}
        <div className="mt-6">
          <ScanHistoryGrid
            history={history}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onViewDetail={viewDetail}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <ScanHistoryDetailModal
        isOpen={isModalOpen}
        onClose={closeDetail}
        data={selectedItem}
      />
    </motion.div>
  );
}