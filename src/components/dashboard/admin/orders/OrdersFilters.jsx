'use client';

import { motion } from 'framer-motion';
import DataTableToolbar from '@/components/common/table/DataTableToolbar';

const FULFILLMENT_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const TAG_ASSIGNMENT_OPTIONS = [
  { value: 'all', label: 'All Tags' },
  { value: 'pending_assignment', label: 'Pending QR Assignment' },
  { value: 'complete', label: 'QR Assigned' },
  { value: 'none', label: 'No Tag' },
];

const PAYMENT_OPTIONS = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function OrdersFilters({
  search,
  onSearchChange,
  fulfillmentStatus,
  onFulfillmentChange,
  tagAssignmentStatus,
  onTagAssignmentChange,
  paymentStatus,
  onPaymentChange,
  sort,
  onSortChange,
  totalItems = 0,
  isLoading = false,
}) {
  const hasActiveFilters = Boolean(
    (search && search.trim()) ||
    (fulfillmentStatus && fulfillmentStatus !== 'all') ||
    (tagAssignmentStatus && tagAssignmentStatus !== 'all') ||
    (paymentStatus && paymentStatus !== 'all') ||
    (sort && sort !== 'newest')
  );

  const handleReset = () => {
    onSearchChange?.('');
    onFulfillmentChange?.('all');
    onTagAssignmentChange?.('all');
    onPaymentChange?.('all');
    onSortChange?.('newest');
  };

  const filters = [
    {
      key: 'tagAssignment',
      value: tagAssignmentStatus,
      onChange: onTagAssignmentChange,
      placeholder: 'All Tags',
      options: TAG_ASSIGNMENT_OPTIONS,
    },
    {
      key: 'fulfillment',
      value: fulfillmentStatus,
      onChange: onFulfillmentChange,
      placeholder: 'All Statuses',
      options: FULFILLMENT_OPTIONS,
    },
    onPaymentChange && {
      key: 'payment',
      value: paymentStatus,
      onChange: onPaymentChange,
      placeholder: 'All Payments',
      options: PAYMENT_OPTIONS,
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
          placeholder: 'Search by order ID, customer, or product...',
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
          label: 'orders',
        }}
      />
    </motion.div>
  );
}
