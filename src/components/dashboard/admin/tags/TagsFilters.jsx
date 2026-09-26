'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'unused', label: 'Unused / Unassigned' },
  { value: 'assigned', label: 'Assigned to Order' },
  { value: 'activated', label: 'Activated / Claimed' },
  { value: 'disabled', label: 'Disabled' },
];

export default function TagsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
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
          placeholder: 'Search by tag code...',
          isLoading,
        }}
        filters={[
          {
            key: 'status',
            value: status,
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
          label: 'tags',
        }}
      />
    </motion.div>
  );
}
