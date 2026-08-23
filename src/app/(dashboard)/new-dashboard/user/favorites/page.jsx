'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites, useRemoveFavoriteMutation, useFavoriteStats } from '@/hooks/favorite-service/useFavorites';
import Pagination from '@/components/ui/Pagination';
import FavoritesHeader from '@/components/favorites/FavoritesHeader';
import FavoritesStats from '@/components/favorites/FavoritesStats';
import FavoritesFilters from '@/components/favorites/FavoritesFilters';
import FavoriteCard from '@/components/favorites/FavoriteCard';
import FavoriteDetailModal from '@/components/favorites/FavoriteDetailModal';
import { FavoritesEmptyState, FavoritesFilteredEmpty } from '@/components/favorites/FavoritesEmptyStates';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import useShareQuote from '@/hooks/useShareQuote';
import ShareQuoteModal from '@/components/quote/ShareQuoteModal';

const FAVORITES_PER_PAGE = 12;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: (i % 3) * 0.06, duration: 0.3, ease: 'easeOut' } }),
};

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const { isShareOpen, shareData, closeShare, shareQuote } = useShareQuote();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [detailItem, setDetailItem] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  // Server-driven: search/category/sort all pass through to the backend.
  // sortBy / sortOrder computed from local sort state:
  const sortBy = sort === 'oldest' ? 'createdAt' : 'createdAt';
  const sortOrder = sort === 'oldest' ? 'asc' : 'desc';

  const { data, isLoading, isError, error } = useFavorites({
    page,
    limit: FAVORITES_PER_PAGE,
    type: 'quote',
    search: debouncedSearch,
    category: category !== 'all' ? category : '',
    sortBy,
    sortOrder,
  });
  const { data: statsRaw } = useFavoriteStats();
  const removeFavorite = useRemoveFavoriteMutation();
  const { data: quoteCategories = [] } = useQuoteCategories();

  const favorites = data?.data || [];
  const meta = data?.meta || { page: 1, limit: FAVORITES_PER_PAGE, total: 0, totalPage: 0 };

  // Alphabetical sort (A-Z) handling
  const displayedFavorites = useMemo(() => {
    if (sort === 'alphabetical') {
      return [...favorites].sort((a, b) => {
        const aText = (a.quote?.text || a.text || '').trim();
        const bText = (b.quote?.text || b.text || '').trim();
        return aText.localeCompare(bText);
      });
    }
    return favorites;
  }, [favorites, sort]);

  // Reset page when filters change.
  useEffect(() => { setPage(1); }, [debouncedSearch, category, sort]);

  const handleRemove = useCallback((favoriteId) => { removeFavorite.mutate(favoriteId); }, [removeFavorite]);
  const handleReset = useCallback(() => { setSearch(''); setCategory('all'); setSort('newest'); }, []);

  // Compute stats from the favorites response (total + distinct categories from the current page).
  const stats = useMemo(() => {
    const cats = new Set(favorites.map((f) => f.quote?.category).filter(Boolean));
    return {
      total: meta.total || 0,
      categories: cats.size || 0,
      recently: 0,
      collections: 1,
    };
  }, [favorites, meta.total]);

  if (isLoading && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <FavoritesHeader total={0} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl border border-white/6 bg-card animate-pulse light:border-[#E8DFCE]/80" />)}
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 rounded-2xl border border-white/6 bg-card animate-pulse light:border-[#E8DFCE]/80" />)}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <FavoritesHeader total={0} />
          <div className="mt-10 flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="relative"><div className="absolute inset-0 rounded-full bg-red-500/15 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10"><span className="text-2xl">&#9888;&#65039;</span></div>
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">Oops! Something went wrong</h3>
            <p className="mt-2 max-w-sm text-sm text-foreground-tertiary">{error?.message || 'Failed to load favorites.'}</p>
            <button onClick={() => window.location.reload()} className="mt-6 h-10 cursor-pointer rounded-xl border border-white/6 bg-muted px-5 text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md light:border-[#E8DFCE]/80">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(debouncedSearch || category !== 'all' || sort !== 'newest');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <FavoritesHeader total={meta.total} />

        <div className="mt-6">
          <FavoritesStats stats={stats} />
        </div>

        <div className="mt-6">
          <FavoritesFilters search={search} category={category} sort={sort} view={view} categories={quoteCategories}
            onSearchChange={setSearch} onCategoryChange={setCategory} onSortChange={setSort} onViewChange={setView} onReset={handleReset} />
        </div>

        <div className="mt-6">
          {favorites.length === 0 ? (
            hasActiveFilters ? <FavoritesFilteredEmpty onReset={handleReset} /> : <FavoritesEmptyState />
          ) : (
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5' : 'grid-cols-1 gap-4'}`}>
                  {displayedFavorites.map((fav, i) => (
                    <motion.div key={fav._id} custom={i} initial="hidden" animate="show" variants={itemVariants}>
                      <FavoriteCard favorite={fav} view={view} onRemove={handleRemove} onViewDetail={setDetailItem} onShare={shareQuote} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
              {meta.totalPage > 1 && (
                <div className="mt-10"><Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} /></div>
              )}
            </div>
          )}
        </div>
      </div>

      <FavoriteDetailModal favorite={detailItem} onClose={() => setDetailItem(null)} onRemove={handleRemove} onShare={shareQuote} />

      {/* Unified Share Quote Modal */}
      <ShareQuoteModal
        isOpen={isShareOpen}
        onClose={closeShare}
        quoteData={shareData}
      />
    </motion.div>
  );
}
