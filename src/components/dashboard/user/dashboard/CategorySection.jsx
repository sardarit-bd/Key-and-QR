'use client';

import { Sparkles, Lock, Check, LayoutGrid, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Card from './Card';

/**
 * Explore Categories — client image:
 * icon + name + premium/locked/available state; disabled when backend
 * says unavailable. Clicking an available category triggers the receive
 * flow (loading → reveal) handled by the parent DashboardHome.
 */
export default function CategorySection({ categories, onSelectCategory, disabled }) {
  const router = useRouter();
  const categoryList = Array.isArray(categories) ? categories : [];

  const handleClick = (category) => {
    if (category?.isLocked || category?.isAvailableToday === false) return;
    onSelectCategory(category);
  };

  const handleViewAll = () => {
    router.push('/new-dashboard/user/my-quotes');
  };

  return (
    <Card className="relative overflow-hidden rounded-[22px] sm:rounded-[26px] px-5 sm:px-7 md:px-8 py-6 sm:py-7">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-20 h-80 w-80 rounded-full bg-accent/[0.06] blur-3xl" />
        <div className="absolute -right-28 -bottom-24 h-80 w-80 rounded-full bg-primary/[0.07] blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} fill="currentColor" className="text-accent w-4 h-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Explore
              </span>
            </div>
            <h2 className="mt-1.5 text-[22px] sm:text-[24px] md:text-[28px] leading-tight tracking-tight text-foreground">
              Ready for more inspiration?
            </h2>
            <p className="mt-1.5 text-[13px] sm:text-[14px] leading-6 text-foreground-secondary">
              Choose a category and get a new quote.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-6 flex items-stretch gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
          {categoryList.length > 0 ? (
            categoryList.map((category) => {
              const slug = category?.slug || category?.name || '';
              const Icon = category?.iconComponent || Sparkles;
              const isLocked = !!category?.isLocked || category?.isAvailableToday === false;
              const isPremium = !!category?.isPremium;

              return (
                <button
                  key={category?.id || slug}
                  onClick={() => handleClick(category)}
                  disabled={isLocked || disabled}
                  className={`
                    group relative flex min-h-[104px] min-w-[104px] shrink-0 flex-col items-center justify-center gap-1.5
                    rounded-[18px] border px-3 py-4
                    transition-all duration-300 active:scale-95
                    ${
                      isLocked
                        ? 'border-white/6 bg-background-secondary/40 backdrop-blur-sm cursor-not-allowed'
                        : 'border-white/8 bg-gradient-to-b from-background-secondary/80 to-background-secondary/30 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_32px_-12px_rgb(0_0_0/0.5)]'
                    }
                  `}
                >
                  {/* Premium marker */}
                  {isPremium && (
                    <span className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-gradient-to-tr from-accent/30 to-accent/10 shadow-[0_0_14px_rgba(253,182,92,0.3)]">
                      <Sparkles size={11} className="text-accent" />
                    </span>
                  )}

                  {/* Icon */}
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isLocked
                        ? 'bg-background-tertiary/40'
                        : 'bg-background-tertiary/60 group-hover:bg-accent/10'
                    }`}
                  >
                    {isLocked ? (
                      <Lock size={18} className="text-muted-foreground" />
                    ) : (
                      <Icon
                        size={22}
                        strokeWidth={2}
                        className={`w-[20px] h-[20px] ${category?.colorClass || 'text-accent'} transition-transform duration-300 group-hover:scale-110`}
                      />
                    )}
                  </span>

                  <span className="text-[12px] sm:text-[13px] font-semibold text-foreground">
                    {category?.name || 'Inspire'}
                  </span>

                  {isLocked ? (
                    <span className="text-[10px] font-medium text-foreground-tertiary">
                      {isPremium ? 'Premium' : 'Unavailable'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-foreground-tertiary">
                      <Check size={10} className="text-accent" strokeWidth={2.5} />
                      Available
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="py-8 text-[13px] text-foreground-secondary">
              No categories available right now.
            </p>
          )}

          {/* View All — premium secondary action */}
          <button
            onClick={handleViewAll}
            className="group relative flex min-h-[104px] min-w-[104px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-white/10 px-4 transition-all duration-300 hover:border-accent/30 hover:bg-accent/[0.04] active:scale-95"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background-tertiary/50 text-foreground-secondary transition-all duration-300 group-hover:text-accent group-hover:bg-accent/10">
              <LayoutGrid size={20} className="w-5 h-5" />
            </span>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-foreground-secondary group-hover:text-foreground">
              View All
              <ArrowRight size={12} className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
            <span className="text-[10px] text-foreground-tertiary">Categories</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
