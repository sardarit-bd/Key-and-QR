'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import InspirationCategoryCard from './InspirationCategoryCard';

export default function InspirationCategoryGrid({ categories = [], isLoading = false }) {
  const [categorySearch, setCategorySearch] = useState('');

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

  const showSearch = categories.length > 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div
            key={idx}
            className="h-52 rounded-2xl border border-border/60 bg-card/40 animate-pulse p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-xl bg-muted/60" />
              <div className="h-5 w-16 rounded-full bg-muted/60" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted/60" />
              <div className="h-3.5 w-full rounded bg-muted/40" />
            </div>
            <div className="h-4 w-1/3 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-border/50 bg-card/30 p-8">
        <p className="text-sm text-foreground-tertiary">No categories available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category search field */}
      {showSearch && (
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border/80 bg-background/80 text-xs sm:text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
          />
        </div>
      )}

      {/* Categories Grid: 4 columns desktop, 3 columns tablet, 2 columns mobile */}
      {filteredCategories.length === 0 ? (
        <div className="py-8 text-center rounded-2xl border border-border/50 bg-card/30 p-6">
          <p className="text-xs sm:text-sm text-foreground-tertiary">
            No categories matching &ldquo;{categorySearch}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((category, idx) => (
            <InspirationCategoryCard
              key={category._id || category.slug || idx}
              category={category}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
