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
          placeholder="Search by tag code..."
        />

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-56 h-9">
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
        {totalItems} {totalItems === 1 ? 'tag' : 'tags'} found
      </p>
    </motion.div>
  );
}
