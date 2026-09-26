'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Draft / Inactive' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function ProductsFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  status,
  onStatusChange,
  sort,
  onSortChange,
  totalItems = 0,
  viewTrash = false,
  isLoading = false,
}) {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat) => ({
      value: cat.id || cat._id || cat,
      label: cat.name || cat,
    })),
  ];

  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (category && category !== 'all') ||
    (!viewTrash && status && status !== 'all') ||
    (sort && sort !== 'newest')
  );

  const handleReset = () => {
    onSearchChange?.('');
    onCategoryChange?.('all');
    if (!viewTrash) onStatusChange?.('all');
    onSortChange?.('newest');
  };

  const filters = [
    {
      key: 'category',
      value: category,
      onChange: onCategoryChange,
      placeholder: 'All Categories',
      options: categoryOptions,
    },
    !viewTrash && {
      key: 'status',
      value: status,
      onChange: onStatusChange,
      placeholder: 'Status',
      options: STATUS_OPTIONS,
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
          placeholder: viewTrash
            ? 'Search deleted products...'
            : 'Search by name, category, or brand...',
          isLoading,
        }}
        filters={filters}
        sort={{
          value: sort,
          onChange: onSortChange,
          placeholder: 'Newest First',
          options: SORT_OPTIONS,
        }}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        resetLabel="Reset"
        summary={{
          total: totalItems,
          label: viewTrash ? 'products in trash' : 'products',
        }}
      />
    </motion.div>
  );
}
