'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function CategoryFilters({
  search,
  onSearchChange,
  isActive,
  onStatusChange,
  totalItems = 0,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (isActive && isActive !== 'all')
  );

  const handleReset = () => {
    onSearchChange?.('');
    onStatusChange?.('all');
  };

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
          placeholder: 'Search by name, slug, or description...',
          isLoading,
        }}
        filters={[
          {
            key: 'status',
            value: isActive,
            onChange: onStatusChange,
            placeholder: 'All Statuses',
            options: STATUS_OPTIONS,
          },
        ]}
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
