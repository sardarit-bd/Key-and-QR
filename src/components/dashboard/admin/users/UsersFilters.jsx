'use client';

import { ArrowUpDown } from 'lucide-react';
import AdminSearchInput from '@/components/dashboard/admin/common/AdminSearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'user', label: 'User' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
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
      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search users by name or email..."
        />

        {/* Role filter */}
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="w-full sm:w-36 h-9 cursor-pointer">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-36 h-9 cursor-pointer">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-40 h-9 cursor-pointer">
            <ArrowUpDown size={14} className="text-foreground-tertiary" />
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-foreground-tertiary">
          {totalItems} {totalItems === 1 ? 'user' : 'users'} found
        </p>
      </div>
    </motion.div>
  );
}
