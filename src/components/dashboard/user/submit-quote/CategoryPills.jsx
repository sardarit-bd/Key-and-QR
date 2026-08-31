'use client';

import { Sparkles } from 'lucide-react';
import { getCategoryIcon } from '@/components/public/quote/category';
import { useSubmissionCategoryOptions } from './submitQuote.constants';

/**
 * Premium category pills — horizontally scrollable on mobile,
 * animated selection state. Options come from the backend Category
 * collection (single source of truth) filtered to the valid submission set.
 */
export default function CategoryPills({ value, onChange, categories }) {
  const { options, isLoading } = useSubmissionCategoryOptions(categories);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Sparkles size={13} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
          Category
        </span>
      </div>

      {isLoading && options.length === 0 ? (
        <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1.5 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[72, 88, 64, 80].map((w, i) => (
            <div
              key={i}
              style={{ width: `${w}px` }}
              className="h-8 rounded-full border border-neutral-200/60 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/50 animate-pulse shrink-0"
            />
          ))}
        </div>
      ) : (
        /* Horizontal scroll on mobile with touch padding, wrap on desktop */
        <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-1.5 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {options.map((cat) => {
            const isSelected = value === cat.id;
            const CategoryIcon = getCategoryIcon(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                aria-pressed={isSelected}
                className={`group relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] font-medium transition-all duration-200 active:scale-95 whitespace-nowrap shadow-sm ${
                  isSelected
                    ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                    : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-amber-500/40 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                {CategoryIcon && (
                  <CategoryIcon
                    size={14}
                    className={`relative z-10 shrink-0 transition-colors ${
                      isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                    }`}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
                {isSelected && (
                  <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
