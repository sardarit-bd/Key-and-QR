'use client';

import DataTableToolbar from '@/components/common/table/DataTableToolbar';
import { useSubmissionCategoryOptions } from './submitQuote.constants';

const STATUS_OPTIONS = [
  { id: 'all', name: 'All Statuses' },
  { id: 'pending', name: 'Pending' },
  { id: 'approved', name: 'Approved' },
  { id: 'rejected', name: 'Rejected' },
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
];

/**
 * Submission history filters — search, category, status, sort.
 * Uses unified DataTableToolbar with 60fps local buffering & 400ms debounce.
 */
export default function SubmissionFilters({
  search,
  category,
  status,
  sort,
  categories,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onReset,
  totalItems,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (category && category !== 'all') ||
    (status && status !== 'all') ||
    (sort && sort !== 'newest')
  );

  const { options: submissionCategoryOptions } = useSubmissionCategoryOptions(categories);

  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...submissionCategoryOptions.map((cat) => ({ id: cat.id, name: cat.label })),
  ];

  return (
    <DataTableToolbar
      variant="user"
      search={{
        value: search,
        onChange: onSearchChange,
        placeholder: 'Search your submissions...',
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
        {
          key: 'status',
          value: status,
          onChange: onStatusChange,
          placeholder: 'Status',
          options: STATUS_OPTIONS,
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
      resetLabel="Reset Filters"
      summary={
        totalItems !== undefined
          ? { total: totalItems, label: 'submissions' }
          : hasActiveFilters
          ? 'Filters applied'
          : 'All submissions'
      }
    />
  );
}
