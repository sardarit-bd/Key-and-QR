'use client';

import AdminSearchInput from '@/components/dashboard/admin/common/AdminSearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by order ID, customer, or product..."
        />

        {/* Tag Assignment filter */}
        <Select value={tagAssignmentStatus} onValueChange={onTagAssignmentChange}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            {TAG_ASSIGNMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fulfillment status filter */}
        <Select value={fulfillmentStatus} onValueChange={onFulfillmentChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {FULFILLMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment status filter */}
        <Select value={paymentStatus} onValueChange={onPaymentChange}>
          <SelectTrigger className="w-full sm:w-32 h-9">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">
        {totalItems} {totalItems === 1 ? 'order' : 'orders'} found
      </p>
    </motion.div>
  );
}
