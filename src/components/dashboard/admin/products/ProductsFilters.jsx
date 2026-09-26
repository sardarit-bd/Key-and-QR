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
  { value: 'inactive', label: 'Draft / Inactive' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function ProductsFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  status,
  onStatusChange,
  sort,
  onSortChange,
  totalItems = 0,
  viewTrash = false,
  isLoading = false,
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
          placeholder={viewTrash ? "Search deleted products..." : "Search by name, category, or brand..."}
          isLoading={isLoading}
        />

        {/* Category filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-44 h-9">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id || cat._id || cat} value={cat.id || cat._id || cat}>
                {cat.name || cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter (only lifecycle statuses, hidden when viewing trash) */}
        {!viewTrash && (
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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
        {totalItems} {totalItems === 1 ? 'product' : 'products'} found
        {viewTrash ? ' in trash' : ''}
      </p>
    </motion.div>
  );
}
