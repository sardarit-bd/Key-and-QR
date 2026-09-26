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
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search by name, slug, or description..."
          aria-label="Search categories"
        />

        <Select value={isActive} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">
        {totalItems} {totalItems === 1 ? 'category' : 'categories'} found
      </p>
    </motion.div>
  );
}
