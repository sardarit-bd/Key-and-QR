'use client';

import { Sparkles } from 'lucide-react';
import { getCategoryIcon } from '@/components/category';
import { useSubmissionCategoryOptions } from './submitQuote.constants';

/**
 * Premium category pills — horizontally scrollable on mobile,
 * animated selection state. Options come from the backend Category
 * collection (single source of truth) filtered to the valid submission set.
 */
export default function CategoryPills({ value, onChange }) {
  const { options, isLoading } = useSubmissionCategoryOptions();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/25 bg-accent/10 shadow-[0_0_16px_rgba(253,182,92,0.12)]">
          <Sparkles size={13} className="text-accent" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Category
        </span>
      </div>

      {/* Horizontal scroll on mobile, wrap on desktop */}
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {options.map((cat) => {
          const isSelected = value === cat.id;
          const CategoryIcon = getCategoryIcon(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              aria-pressed={isSelected}
              className={`group relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all duration-300 active:scale-95 ${
                isSelected
                  ? 'border-accent/50 bg-gradient-to-r from-accent/20 to-accent/10 text-accent shadow-[0_0_20px_-4px_rgba(253,182,92,0.45)] dark:text-amber-200'
                  : 'border-white/8 bg-background-secondary/40 text-foreground-secondary hover:-translate-y-0.5 hover:border-accent/30 hover:text-foreground hover:shadow-[0_8px_20px_-8px_rgb(0_0_0/0.4)] light:border-[#E8DFCE]/70 light:bg-white/60'
              }`}
            >
              {/* Selection glow ring */}
              {isSelected && (
                <>
                  <span className="pointer-events-none absolute -inset-px rounded-full bg-accent/15 blur-[6px]" />
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-accent/30" />
                </>
              )}
              {CategoryIcon && (
                <CategoryIcon
                  size={14}
                  className={`relative z-10 shrink-0 transition-colors ${
                    isSelected ? 'text-accent' : 'text-foreground-tertiary group-hover:text-foreground-secondary'
                  }`}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
              {isSelected && (
                <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(253,182,92,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
