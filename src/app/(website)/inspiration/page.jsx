'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutGrid,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import InspirationCategoryCard from '@/components/public/quote/inspiration/InspirationCategoryCard';

export default function InspirationPage() {
  const [categorySearch, setCategorySearch] = useState('');

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useQuoteCategories();

  // Filter categories instantly by search input
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const query = categorySearch.toLowerCase().trim();
    return categories.filter((cat) => {
      const name = (cat.name || '').toLowerCase();
      const slug = (cat.slug || '').toLowerCase();
      const desc = (cat.description || '').toLowerCase();
      return name.includes(query) || slug.includes(query) || desc.includes(query);
    });
  }, [categories, categorySearch]);

  return (
    <div
      className="relative w-full overflow-hidden bg-background min-h-screen"
      style={{
        backgroundImage: "url('/inspiration/Inspiration.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Decorative ambient gradient overlay for soft atmosphere & high text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FAF9F7]/95 via-[#FAF9F7]/90 to-[#FAF9F7]/80 dark:from-background/95 dark:via-background/90 dark:to-background/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      {/* Main Centered Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl min-h-[80vh] px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-24 sm:pb-16">

        {/* ========================================================
            BROWSE CATEGORIES SECTION HEADER
           ======================================================== */}
        <section className="mt-4 sm:mt-8 md:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Category Icon Container */}
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 shadow-2xs">
                <LayoutGrid size={22} className="sm:w-6 sm:h-6" strokeWidth={2} />
              </div>

              {/* Title and Subtitle */}
              <div>
                <h2 className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-transparent">
                  Browse Categories
                </h2>
                <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
                  Choose a category to explore dedicated quotes and daily messages.
                </p>
              </div>
            </div>

            {/* Dynamic Category Count Pill */}
            {categories.length > 0 && (
              <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold shadow-2xs whitespace-nowrap">
                <Sparkles size={13} className="text-purple-500 shrink-0" />
                <span>
                  {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>
            )}
          </div>

          {/* ========================================================
              CATEGORY GRID (Full width on mobile, responsive grid)
             ======================================================== */}
          {isCategoriesError ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 text-center space-y-4">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <div>
                <p className="text-base font-semibold text-destructive">Unable to load categories</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Please check your connection and try again.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCategories()}
                className="gap-2 cursor-pointer rounded-xl"
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : isCategoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full max-w-full lg:max-w-[70%]">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="min-h-[140px] rounded-3xl border border-border/60 bg-card/40 animate-pulse p-5 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-muted/70 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-2/3 rounded-md bg-muted/70" />
                      <div className="h-3 w-1/2 rounded bg-muted/40" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <div className="h-3.5 w-24 rounded bg-muted/40" />
                    <div className="h-7 w-7 rounded-full bg-muted/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-12 text-center rounded-3xl border border-border/60 bg-card/40 p-8">
              <p className="text-sm sm:text-base text-foreground-secondary">
                {categorySearch ? `No categories matching "${categorySearch}".` : 'No categories available yet.'}
              </p>
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="mt-3 text-xs sm:text-sm font-medium text-primary hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full max-w-full lg:max-w-[70%]">
              {filteredCategories.map((category, idx) => (
                <InspirationCategoryCard
                  key={category._id || category.slug || idx}
                  category={category}
                  index={idx}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
