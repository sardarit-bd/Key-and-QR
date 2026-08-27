'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// Shared premium control chrome — matches Overview surface language.
const CONTROL_CLASS =
  'h-11 cursor-pointer rounded-xl border border-white/6 bg-background-secondary/50 backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-background-secondary/70 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70';

/**
 * Submission history filters — search, category, status, sort.
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
}) {
  const hasActiveFilters = search || category !== 'all' || status !== 'all' || sort !== 'newest';
  const { options: submissionCategoryOptions } = useSubmissionCategoryOptions(categories);

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
        {/* Search */}
        <div className={`relative w-full lg:w-64 col-span-1 sm:col-span-2 lg:col-span-1 ${CONTROL_CLASS}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search your submissions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-full w-full border-0 bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
        </div>

        {/* Category */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className={`w-full lg:w-44 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80 max-h-64">
            <SelectItem value="all">All Categories</SelectItem>
            {submissionCategoryOptions.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className={`w-full lg:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className={`w-full lg:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-11 w-full sm:w-auto cursor-pointer gap-1.5 rounded-xl px-3.5 text-foreground-tertiary transition-all duration-300 hover:bg-background-secondary/70 hover:text-foreground col-span-1 sm:col-span-2 lg:col-span-1"
          >
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>

      <span className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground-tertiary self-end lg:self-center">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {hasActiveFilters ? 'Filters applied' : 'All submissions'}
      </span>
    </div>
  );
}
