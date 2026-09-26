'use client';

import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
];

/**
 * Scan History Filters
 * Uses unified DataTableToolbar with 60fps keystroke buffering & 400ms debounce.
 */
export default function ScanHistoryFilters({
  search,
  category,
  sort,
  categories = [],
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
  totalItems,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (category && category !== 'all') ||
    (sort && sort !== 'newest')
  );

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map((cat) => ({ id: cat.slug || cat.id, name: cat.name })),
  ];

  return (
    <DataTableToolbar
      variant="user"
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: 'Search by quote or tag...',
        isLoading,
      }}
      filters={[
        {
          key: 'category',
          value: category,
          onChange: onCategoryChange,
          placeholder: 'Category',
          options: categoryOptions,
        },
      ]}
      sort={{
        value: sort,
        onChange: onSortChange,
        placeholder: 'Sort By',
        options: SORT_OPTIONS,
      }}
      hasActiveFilters={hasActiveFilters}
      onReset={onReset}
      resetLabel="Reset"
      summary={
        totalItems !== undefined
          ? { total: totalItems, label: 'scans' }
          : hasActiveFilters
          ? 'Filters applied'
          : 'All scans'
      }
    />
  );
}
