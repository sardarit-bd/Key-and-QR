'use client';

import { Search, X, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useRef, useCallback } from 'react';

const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First' },
  { id: 'oldest', name: 'Oldest First' },
  { id: 'alphabetical', name: 'A-Z' },
];

const CONTROL_CLASS =
  'h-11 cursor-pointer rounded-xl border border-white/6 bg-background-secondary/50 backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-background-secondary/70 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70';

export default function FavoritesFilters({
  search, category, sort, view, categories = [],
  onSearchChange, onCategoryChange, onSortChange, onViewChange, onReset,
}) {
  const inputRef = useRef(null);
  const hasActiveFilters = search || category !== 'all' || sort !== 'newest';

  const handleSearchChange = useCallback((value) => { onSearchChange(value); }, [onSearchChange]);

  // Build dropdown from backend categories (fallback to 'All Categories' only).
  const categoryOptions = [
    { id: 'all', name: 'All Categories' },
    ...categories.map((cat) => ({ id: cat.slug || cat.id, name: cat.name })),
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        <div className={`relative w-full sm:w-64 ${CONTROL_CLASS}`}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
          <Input type="text" placeholder="Search favorites..." value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-full w-full border-0 bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
        </div>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className={`w-full sm:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
            {categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className={`w-full sm:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
            {SORT_OPTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-11 cursor-pointer gap-1.5 rounded-xl px-3.5 text-foreground-tertiary transition-all duration-300 hover:bg-background-secondary/70 hover:text-foreground">
            <X className="h-4 w-4" /> Reset
          </Button>
        )}
      </div>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <span className="flex items-center gap-1.5 text-sm text-foreground-tertiary">
          <SlidersHorizontal className="h-3.5 w-3.5" /> {hasActiveFilters ? 'Filters applied' : 'All favorites'}
        </span>
        <div className="flex items-center gap-1 rounded-xl border border-white/6 bg-background-secondary/50 p-1 backdrop-blur-md light:border-[#E8DFCE]/80 light:bg-white/70">
          <Button variant="ghost" size="icon" onClick={() => onViewChange('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}
            className={`h-8 w-8 cursor-pointer rounded-lg transition-all duration-300 ${view === 'grid' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_16px_-4px_rgba(251,113,133,0.3)]' : 'text-foreground-tertiary hover:bg-background-secondary/70 hover:text-foreground'}`}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onViewChange('list')} aria-label="List view" aria-pressed={view === 'list'}
            className={`h-8 w-8 cursor-pointer rounded-lg transition-all duration-300 ${view === 'list' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_16px_-4px_rgba(251,113,133,0.3)]' : 'text-foreground-tertiary hover:bg-background-secondary/70 hover:text-foreground'}`}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
