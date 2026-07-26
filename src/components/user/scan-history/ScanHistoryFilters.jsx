'use client';

import { Search, X } from 'lucide-react';
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

/**
 * Scan History Filters
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
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by quote or tag..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card border-border rounded-xl h-11 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-emerald-500/50"
          />
        </div>

        {/* Category Filter */}
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border rounded-xl h-11 text-foreground-secondary hover:bg-muted">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-40 bg-card border-border rounded-xl h-11 text-foreground-secondary hover:bg-muted">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-foreground">
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
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="text-sm text-foreground-tertiary">
        {hasActiveFilters ? 'Filters applied' : 'All scans'}
      </div>
    </div>
  );
}
