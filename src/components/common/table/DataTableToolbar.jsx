'use client';

import React from 'react';
import {
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AdminSearchInput from '@/components/dashboard/admin/common/AdminSearchInput';
import { cn } from '@/lib/utils';

/**
 * Universal, high-performance DataTableToolbar component
 * Designed for both User Dashboard and Admin Dashboard.
 */
export default function DataTableToolbar({
  search,
  filters = [],
  sort,
  hasActiveFilters = false,
  onReset,
  resetLabel = 'Reset Filters',
  viewMode,
  summary,
  actions,
  children,
  variant = 'admin',
  className = '',
}) {
  const isUser = variant === 'user';

  // Surface classes based on variant
  const triggerBaseClass = isUser
    ? 'h-10 sm:h-11 rounded-xl border border-white/6 bg-background-secondary/50 backdrop-blur-md text-xs sm:text-sm text-foreground-secondary hover:border-white/12 hover:bg-background-secondary/70 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70 transition-all duration-200'
    : 'h-10 rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-md text-xs sm:text-sm text-neutral-200 hover:border-white/20 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all duration-200';

  const triggerActiveClass = isUser
    ? 'border-accent/50 bg-accent/10 text-accent font-medium shadow-[0_0_15px_-3px_rgba(253,182,92,0.25)] dark:text-amber-200'
    : 'border-amber-500/40 bg-amber-500/10 text-amber-300 font-medium shadow-[0_0_12px_-2px_rgba(245,158,11,0.2)]';

  const contentClass = isUser
    ? 'rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80'
    : 'rounded-xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl backdrop-blur-xl';

  const searchClass = isUser
    ? 'h-10 sm:h-11 border-white/6 bg-background-secondary/50 backdrop-blur-md hover:border-white/12 hover:bg-background-secondary/70 focus-within:border-accent/50 focus-within:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70'
    : '';

  // Auto-compute active state if not strictly boolean
  const isFilterActive =
    hasActiveFilters ||
    Boolean(search?.value) ||
    filters.some(
      (f) =>
        f.value !== undefined &&
        f.value !== 'all' &&
        f.value !== '' &&
        f.value !== null
    ) ||
    (sort?.value && sort?.value !== 'newest');

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:gap-4 w-full transition-all duration-200',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Search + Filter Selects + Sort + Reset */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto flex-1">
          {/* 1. Search Box */}
          {search && (
            <div className="w-full sm:w-72 lg:max-w-md shrink-0">
              <AdminSearchInput
                placeholder={search.placeholder || 'Search...'}
                {...search}
                className={cn(searchClass, search.className)}
              />
            </div>
          )}

          {/* 2. Filter Dropdowns */}
          {filters.map((filter) => {
            if (!filter) return null;
            const filterKey = filter.key || filter.label || filter.placeholder;
            const isActive =
              filter.value !== undefined &&
              filter.value !== 'all' &&
              filter.value !== '' &&
              filter.value !== null;
            const options = filter.options || [];

            return (
              <div
                key={filterKey}
                className={cn('w-full sm:w-auto min-w-[130px] shrink-0', filter.containerClassName)}
              >
                <Select
                  value={filter.value !== undefined ? String(filter.value) : undefined}
                  onValueChange={filter.onChange}
                  disabled={filter.disabled}
                >
                  <SelectTrigger
                    className={cn(
                      triggerBaseClass,
                      'w-full sm:w-auto px-3.5 gap-2',
                      isActive && triggerActiveClass,
                      filter.className
                    )}
                  >
                    {filter.icon && (
                      <filter.icon
                        size={14}
                        className={cn(
                          'shrink-0 text-foreground-tertiary',
                          isActive && (isUser ? 'text-accent' : 'text-amber-400')
                        )}
                      />
                    )}
                    <SelectValue placeholder={filter.placeholder || filter.label} />
                  </SelectTrigger>
                  <SelectContent className={contentClass}>
                    {options.map((opt) => {
                      const val = opt.value !== undefined ? opt.value : opt.id;
                      const label =
                        opt.label !== undefined ? opt.label : opt.name || val;
                      return (
                        <SelectItem
                          key={String(val)}
                          value={String(val)}
                          className="cursor-pointer text-xs sm:text-sm"
                        >
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            );
          })}

          {/* 3. Sort Selector */}
          {sort && (
            <div className={cn('w-full sm:w-auto min-w-[130px] shrink-0', sort.containerClassName)}>
              <Select
                value={sort.value !== undefined ? String(sort.value) : undefined}
                onValueChange={sort.onChange}
                disabled={sort.disabled}
              >
                <SelectTrigger
                  className={cn(
                    triggerBaseClass,
                    'w-full sm:w-auto px-3.5 gap-2',
                    sort.value && sort.value !== 'newest' && triggerActiveClass,
                    sort.className
                  )}
                >
                  <SelectValue placeholder={sort.placeholder || 'Sort By'} />
                </SelectTrigger>
                <SelectContent className={contentClass}>
                  {(sort.options || []).map((opt) => {
                    const val = opt.value !== undefined ? opt.value : opt.id;
                    const label =
                      opt.label !== undefined ? opt.label : opt.name || val;
                    return (
                      <SelectItem
                        key={String(val)}
                        value={String(val)}
                        className="cursor-pointer text-xs sm:text-sm"
                      >
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 4. Reset Filters Pill Button */}
          {onReset && isFilterActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className={cn(
                'h-10 sm:h-11 cursor-pointer gap-1.5 rounded-xl px-3.5 text-xs sm:text-sm transition-all duration-200 border border-dashed',
                isUser
                  ? 'border-white/10 text-foreground-tertiary hover:bg-background-secondary/70 hover:text-foreground hover:border-white/20 light:border-[#E8DFCE]'
                  : 'border-white/15 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/30'
              )}
            >
              <RotateCcw size={13} className="shrink-0" />
              <span>{resetLabel}</span>
            </Button>
          )}

          {/* Optional inline custom children */}
          {children}
        </div>

        {/* Right Side Accessories: Summary / ViewMode / Action Buttons */}
        {(summary || viewMode || actions) && (
          <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 self-end lg:self-center w-full lg:w-auto">
            {/* Summary Indicator */}
            {summary && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground-tertiary select-none">
                <SlidersHorizontal size={14} className="shrink-0 text-muted-foreground" />
                {typeof summary === 'object' && 'total' in summary ? (
                  <span>
                    {isFilterActive ? 'Filtered:' : 'Total:'}{' '}
                    <strong className="text-foreground font-semibold">
                      {summary.total?.toLocaleString() ?? 0}
                    </strong>{' '}
                    {summary.label || 'items'}
                  </span>
                ) : (
                  <span>{summary}</span>
                )}
              </div>
            )}

            {/* View Mode Toggle (Grid / List) */}
            {viewMode && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded-xl p-1 backdrop-blur-md shrink-0',
                  isUser
                    ? 'border border-white/6 bg-background-secondary/50 light:border-[#E8DFCE]/80 light:bg-white/70'
                    : 'border border-white/10 bg-neutral-900/60'
                )}
              >
                <button
                  type="button"
                  onClick={() => viewMode.onChange?.('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode.current === 'grid'}
                  className={cn(
                    'h-8 w-8 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200',
                    viewMode.current === 'grid'
                      ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.3)] dark:text-amber-300'
                      : 'text-foreground-tertiary hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => viewMode.onChange?.('list')}
                  aria-label="List view"
                  aria-pressed={viewMode.current === 'list'}
                  className={cn(
                    'h-8 w-8 cursor-pointer rounded-lg flex items-center justify-center transition-all duration-200',
                    viewMode.current === 'list'
                      ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_12px_-2px_rgba(245,158,11,0.3)] dark:text-amber-300'
                      : 'text-foreground-tertiary hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <List size={15} />
                </button>
              </div>
            )}

            {/* Custom Action Slot */}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
