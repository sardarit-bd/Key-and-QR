'use client';

import { use, useState } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useQuoteCategories, useExploreQuotes } from '@/hooks/category/useQuoteCategories';
import { getCategoryIcon, getCategoryLabel } from '@/components/public/quote/category';
import InspirationQuoteGrid from '@/components/public/quote/inspiration/InspirationQuoteGrid';

function getCategoryTheme(slug, customColor) {
  const s = (slug || '').toLowerCase();

  if (customColor && customColor.startsWith('#')) {
    return {
      accentColor: customColor,
      bgTint: 'bg-card/75 dark:bg-slate-900/60',
      iconBg: `${customColor}18`,
      pillBg: 'bg-muted/80 text-foreground-secondary',
    };
  }

  switch (s) {
    case 'love':
      return {
        accentColor: '#f43f5e',
        bgTint: 'bg-rose-500/[0.03] dark:bg-rose-950/[0.15]',
        iconBg: 'rgba(244, 63, 94, 0.12)',
        pillBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
      };
    case 'motivation':
    case 'strength':
      return {
        accentColor: '#f97316',
        bgTint: 'bg-orange-500/[0.03] dark:bg-orange-950/[0.15]',
        iconBg: 'rgba(249, 115, 22, 0.12)',
        pillBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-300',
      };
    case 'wisdom':
    case 'mindfulness':
      return {
        accentColor: '#a855f7',
        bgTint: 'bg-purple-500/[0.03] dark:bg-purple-950/[0.15]',
        iconBg: 'rgba(168, 85, 247, 0.12)',
        pillBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
      };
    case 'hope':
    case 'healing':
      return {
        accentColor: '#14b8a6',
        bgTint: 'bg-teal-500/[0.03] dark:bg-teal-950/[0.15]',
        iconBg: 'rgba(20, 184, 166, 0.12)',
        pillBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
      };
    case 'success':
      return {
        accentColor: '#eab308',
        bgTint: 'bg-amber-500/[0.03] dark:bg-amber-950/[0.15]',
        iconBg: 'rgba(234, 179, 8, 0.12)',
        pillBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
      };
    case 'faith':
      return {
        accentColor: '#f59e0b',
        bgTint: 'bg-amber-500/[0.03] dark:bg-amber-950/[0.15]',
        iconBg: 'rgba(245, 158, 11, 0.12)',
        pillBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
      };
    default:
      return {
        accentColor: '#6366f1',
        bgTint: 'bg-indigo-500/[0.03] dark:bg-indigo-950/[0.15]',
        iconBg: 'rgba(99, 102, 241, 0.12)',
        pillBg: 'bg-muted/80 text-foreground-secondary',
      };
  }
}

export default function CategoryInspirationPage({ params }) {
  const resolvedParams = use(params);
  const rawCategory = resolvedParams?.category ? decodeURIComponent(resolvedParams.category) : '';
  const categorySlug = rawCategory.toLowerCase();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' | 'popular' | 'trending'
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categories = [] } = useQuoteCategories();

  // Match the category from backend active categories
  const matchedCategory = categories.find(
    (c) => (c.slug || '').toLowerCase() === categorySlug || (c.name || '').toLowerCase() === categorySlug
  );

  const categoryName = matchedCategory?.name || getCategoryLabel(categorySlug);
  const theme = getCategoryTheme(categorySlug, matchedCategory?.color);
  const IconComponent = getCategoryIcon(categorySlug);

  // Tab sort resolution
  const computedSort = activeTab === 'popular' ? 'alphabetical' : activeTab === 'trending' ? 'oldest' : sort;

  const {
    data: quotesData,
    isLoading: isQuotesLoading,
    isError: isQuotesError,
    refetch: refetchQuotes,
  } = useExploreQuotes({
    category: categorySlug,
    search,
    sort: computedSort,
    page,
    limit,
  });

  const quotes = quotesData?.data || [];
  const total = quotesData?.meta?.total ?? quotes.length;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background pt-4 sm:pt-6 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            href="/inspiration"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>All Categories</span>
          </Link>
        </div>

        {/* Category Hero Banner */}
        <section className={`relative overflow-hidden rounded-3xl border border-border/80 ${theme.bgTint} backdrop-blur-xl p-6 sm:p-8 shadow-sm`}>
          {/* Ambient Glow */}
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: theme.accentColor }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              {/* Category Icon */}
              <div
                className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl shadow-md transition-transform duration-300"
                style={{
                  backgroundColor: theme.iconBg,
                  color: theme.accentColor,
                }}
              >
                {matchedCategory?.iconUrl ? (
                  <img src={matchedCategory.iconUrl} alt={categoryName} className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
                ) : (
                  <IconComponent className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.2} />
                )}
              </div>

              {/* Category Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                    {categoryName}
                  </h1>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight ${theme.pillBg}`}>
                    {total} {total === 1 ? 'Quote' : 'Quotes'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-foreground-secondary max-w-2xl leading-relaxed">
                  {matchedCategory?.description || `Explore meaningful ${categoryName.toLowerCase()} inspiration and empowering daily reflections.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs (Latest / Popular / Trending) */}
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          {[
            { id: 'latest', label: 'Latest' },
            { id: 'popular', label: 'Popular' },
            { id: 'trending', label: 'Trending' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-foreground text-background font-semibold shadow-sm'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Quotes Exploration Grid & Pagination */}
        <section className="space-y-6">
          {isQuotesError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
              <p className="text-sm text-destructive font-medium">Unable to load quotes for this category.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchQuotes()}
                className="gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                Retry
              </Button>
            </div>
          ) : (
            <InspirationQuoteGrid
              quotes={quotes}
              isLoading={isQuotesLoading}
              search={search}
              onSearchChange={handleSearchChange}
              sort={sort}
              onSortChange={handleSortChange}
              page={page}
              limit={limit}
              total={total}
              onPageChange={handlePageChange}
              emptyMessage={
                search
                  ? `No quotes found matching "${search}".`
                  : 'No quotes available in this category yet.'
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
