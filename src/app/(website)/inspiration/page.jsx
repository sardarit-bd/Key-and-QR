'use client';

import { useState, useMemo } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import InspirationCategoryCard from '@/components/inspiration/InspirationCategoryCard';

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
    <div className="bg-background pt-4 sm:pt-6 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
        {/* 1. Page Header */}
        <section className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Inspiration
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-foreground-secondary leading-relaxed max-w-2xl">
            Explore meaningful quotes and discover something that speaks to you.
          </p>
        </section>

        {/* 2. Browse Categories Section */}
        <section className="space-y-4 sm:space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Browse Categories
            </h2>
            <p className="text-xs sm:text-sm text-foreground-tertiary">
              Choose a category to explore dedicated quotes and daily messages.
            </p>
          </div>

          {/* Search categories input */}
          <div className="relative max-w-sm sm:max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card/80 text-xs sm:text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all shadow-sm"
            />
          </div>

          {/* All Categories heading */}
          <div className="flex items-center justify-between pt-0.5">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              All Categories
            </h3>
            {categories.length > 0 && (
              <span className="text-xs font-medium text-foreground-tertiary">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </span>
            )}
          </div>

          {/* Category Grid */}
          {isCategoriesError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive font-medium">Unable to load categories.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchCategories()}
                className="gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : isCategoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div
                  key={idx}
                  className="h-44 sm:h-52 rounded-2xl border border-border/60 bg-card/40 animate-pulse p-4 sm:p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted/60" />
                    <div className="h-4 w-12 sm:w-16 rounded-full bg-muted/60" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted/60" />
                    <div className="h-3 w-full rounded bg-muted/40" />
                  </div>
                  <div className="h-3.5 w-1/3 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-8 text-center rounded-2xl border border-border/50 bg-card/30 p-6">
              <p className="text-xs sm:text-sm text-foreground-tertiary">
                {categorySearch ? `No categories matching "${categorySearch}".` : 'No categories available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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
