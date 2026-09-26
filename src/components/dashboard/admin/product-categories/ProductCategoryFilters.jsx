'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const LIMIT_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
];

export default function ProductCategoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  limit,
  onLimitChange,
  totalItems = 0,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (status && status !== 'all')
  );

  const handleReset = () => {
    onSearchChange?.('');
    onStatusChange?.('all');
  };

  const filters = [
    {
      key: 'status',
      value: status,
      onChange: onStatusChange,
      placeholder: 'All Status',
      options: STATUS_OPTIONS,
    },
    onLimitChange && {
      key: 'limit',
      value: String(limit),
      onChange: onLimitChange,
      placeholder: '10 per page',
      options: LIMIT_OPTIONS,
    },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <DataTableToolbar
        variant="admin"
        search={{
          value: search,
          onChange: onSearchChange,
          placeholder: 'Search categories by name, slug...',
          isLoading,
        }}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        resetLabel="Reset"
        summary={{
          total: totalItems,
          label: 'categories',
        }}
      />
    </motion.div>
  );
}
