'use client';

import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'alphabetical', name: 'A-Z' },
];

export default function FavoritesFilters({
  search,
  category,
  sort,
  view,
  categories = [],
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onViewChange,
  onReset,
  totalItems,
  isLoading = false,
}) {
  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map((cat) => ({ id: cat.slug || cat.id, name: cat.name })),
  ];

  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (category && category !== 'all') ||
    (sort && sort !== 'newest')
  );

  return (
    <DataTableToolbar
      variant="user"
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: 'Search favorites...',
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
        placeholder: 'Sort',
        options: SORT_OPTIONS,
      }}
      hasActiveFilters={hasActiveFilters}
      onReset={onReset}
      resetLabel="Reset"
      summary={
        totalItems !== undefined
          ? { total: totalItems, label: 'favorites' }
          : hasActiveFilters
          ? 'Filters applied'
          : 'All favorites'
      }
      viewMode={{
        current: view,
        onChange: onViewChange,
      }}
    />
  );
}
