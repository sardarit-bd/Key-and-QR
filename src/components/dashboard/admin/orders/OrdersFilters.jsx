'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by order ID, customer, or product..."
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Fulfillment status filter */}
        <Select value={fulfillmentStatus} onValueChange={onFulfillmentChange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
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
          <SelectTrigger className="w-full sm:w-36 h-9">
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
          <SelectTrigger className="w-full sm:w-40 h-9">
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
