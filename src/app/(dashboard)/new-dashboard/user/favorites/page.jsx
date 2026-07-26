'use client';

import { motion } from 'framer-motion';
import { Heart, Search, Grid3X3, List, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useFavorites, useRemoveFavoriteMutation } from '@/hooks/favorite-service/useFavorites';

const FAVORITES_PER_PAGE = 12;

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);

  const { data, isLoading, error } = useFavorites({
    page,
    limit: FAVORITES_PER_PAGE,
  });
  const removeFavorite = useRemoveFavoriteMutation();

  const favorites = data?.data || [];
  const meta = data?.meta || { total: 0, totalPage: 1 };

  const filteredFavorites = favorites.filter((fav) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const text = fav.product?.name || fav.quote?.text || '';
      return text.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const handleRemove = (favoriteId) => {
    removeFavorite.mutate(favoriteId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load favorites</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-accent underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
            <p className="text-sm text-muted-foreground mt-1">{meta.total} items saved</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search favorites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        {/* Favorites Grid/List */}
        {filteredFavorites.length === 0 ? (
          <div className="mt-12 text-center">
            <Heart className="mx-auto text-muted-foreground" size={48} />
            <p className="mt-4 text-muted-foreground">
              {search ? 'No favorites match your search' : 'No favorites yet'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavorites.map((fav) => (
              <div key={fav._id} className="bg-card rounded-xl p-4 border border-border hover:border-accent/30 transition-colors">
                {fav.product ? (
                  <>
                    <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-3">
                      {fav.product.image?.url ? (
                        <img src={fav.product.image.url} alt={fav.product.name} className="max-h-full object-contain" />
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )}
                    </div>
                    <h3 className="text-foreground font-medium truncate">{fav.product.name}</h3>
                    <p className="text-accent text-sm mt-1">${fav.product.price}</p>
                  </>
                ) : fav.quote ? (
                  <>
                    <div className="h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-lg p-4 flex items-center justify-center mb-3">
                      <p className="text-foreground text-sm italic text-center line-clamp-4">"{fav.quote.text}"</p>
                    </div>
                    <p className="text-foreground-secondary text-xs">{fav.quote.category}</p>
                  </>
                ) : null}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleRemove(fav._id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {filteredFavorites.map((fav) => (
              <div key={fav._id} className="bg-card rounded-xl p-4 border border-border hover:border-accent/30 transition-colors flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  {fav.product ? (
                    fav.product.image?.url ? (
                      <img src={fav.product.image.url} alt="" className="max-h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )
                  ) : (
                    <Heart size={16} className="text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">
                    {fav.product?.name || fav.quote?.text || 'Unknown'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {fav.type === 'product' ? `$${fav.product?.price}` : fav.quote?.category}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(fav._id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPage > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-muted rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              Previous
            </button>
            <span className="text-muted-foreground text-sm">
              Page {page} of {meta.totalPage}
            </span>
            <button
              onClick={() => setPage(Math.min(meta.totalPage, page + 1))}
              disabled={page === meta.totalPage}
              className="px-4 py-2 bg-muted rounded-lg text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/80"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
