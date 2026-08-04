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

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'love', name: 'Love' },
  { id: 'strength', name: 'Strength' },
  { id: 'healing', name: 'Healing' },
  { id: 'faith', name: 'Faith' },
  { id: 'gratitude', name: 'Gratitude' },
];

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
];

// Shared premium control chrome — matches Overview surface language:
// background-secondary surface + white/6 border + accent focus glow.
const CONTROL_CLASS =
  'h-11 cursor-pointer rounded-xl border border-white/6 bg-background-secondary/50 backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-background-secondary/70 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70';

/**
 * Scan History Filters
 * Premium glass search + select controls with focus glow.
 */
export default function ScanHistoryFilters({
  search,
  category,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onReset,
}) {
  const hasActiveFilters = search || category !== 'all' || sort !== 'newest';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className={`relative w-full sm:w-72 ${CONTROL_CLASS}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
          <Input
            type="text"
            placeholder="Search by quote or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-full w-full border-0 bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger
            className={`w-full sm:w-44 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger
            className={`w-full sm:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}
          >
            <SelectValue placeholder="Sort By" />
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
            className="h-11 cursor-pointer gap-1.5 rounded-xl px-3.5 text-foreground-tertiary transition-all duration-300 hover:bg-background-secondary/70 hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-foreground-tertiary">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {hasActiveFilters ? 'Filters applied' : 'All scans'}
      </div>
    </div>
  );
}
