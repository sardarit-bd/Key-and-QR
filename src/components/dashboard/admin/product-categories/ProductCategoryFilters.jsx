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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search categories by name, slug..."
        />

        {/* Status filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rows per page */}
        <Select value={String(limit)} onValueChange={onLimitChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="10 per page" />
          </SelectTrigger>
          <SelectContent>
            {LIMIT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">
        {totalItems} {totalItems === 1 ? 'category' : 'categories'} found
        {status !== 'all' && ` (${status})`}
      </p>
    </motion.div>
  );
}
