import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import myQuotesService from '@/services/myquotes-service/myQuotes.service';
import favoriteService from '@/services/favorite-service/favorite.service';
import { favoriteKeys } from '@/hooks/favorite-service/useFavorites';

// ============================================================
// QUERY KEYS — My Quotes library (received quotes)
// ============================================================

export const myQuoteKeys = {
  all: ['my-quotes'],
  lists: () => [...myQuoteKeys.all, 'list'],
  list: (filters) => [...myQuoteKeys.lists(), { ...filters }],
  stats: () => [...myQuoteKeys.all, 'stats'],
};

// ============================================================
// HOOKS
// ============================================================

/**
 * Get the user's complete quote library.
 * GET /received-quotes/history
 * Backend-paginated via { page, limit }.
 */
export function useMyQuotesList(params = {}) {
  const { page = 1, limit = 12, category = '', source = '' } = params;
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: myQuoteKeys.list({ page, limit, category, source }),
    queryFn: () =>
      myQuotesService.getMyQuotes({ page, limit, category, source }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isAuthenticated(),
    select: (result) => ({
      data: result.data || [],
      meta: result.meta || { page: 1, limit, total: 0, totalPage: 0 },
    }),
  });
}

/**
 * Get quote library statistics.
 * GET /received-quotes/statistics
 */
export function useMyQuoteStats(enabled = true) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: myQuoteKeys.stats(),
    queryFn: () => myQuotesService.getMyQuoteStats(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled: enabled && isAuthenticated(),
    select: (result) =>
      result.data || {
        totalQuotes: 0,
        favorites: 0,
        unread: 0,
        today: 0,
        categoryDistribution: [],
      },
  });
}

// ============================================================
// FAVORITE SYNC
// ============================================================

/**
 * Add a quote to favorites (bookmarks).
 * POST /favorites  { quoteId }
 * Invalidates BOTH the favorites cache and the my-quotes library cache
 * (so favorite state on My Quotes stays fresh). Optimistic update included.
 */
export function useAddQuoteFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId) => favoriteService.addFavorite({ quoteId }),
    onMutate: async (quoteId) => {
      // Optimistically mark the quote as favorited in the library cache.
      await queryClient.cancelQueries({ queryKey: myQuoteKeys.all });
      const snapshot = queryClient.getQueriesData({
        queryKey: myQuoteKeys.lists(),
      });
      queryClient.setQueriesData({ queryKey: myQuoteKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item?.quote?._id === quoteId ? { ...item, favorite: true } : item
          ),
        };
      });
      return { snapshot };
    },
    onSuccess: (data, quoteId) => {
      // Store the returned favoriteId so un-favoriting works immediately
      // without an extra check request.
      const newFavoriteId = data?.data?._id;
      if (newFavoriteId) {
        queryClient.setQueriesData({ queryKey: myQuoteKeys.lists() }, (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item?.quote?._id === quoteId
                ? { ...item, favorite: true, favoriteId: newFavoriteId }
                : item
            ),
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
      queryClient.invalidateQueries({ queryKey: myQuoteKeys.all });
      toast.success('Added to favorites ❤️');
    },
    onError: (error, _quoteId, context) => {
      if (context?.snapshot) {
        queryClient.setQueriesData({ queryKey: myQuoteKeys.lists() }, context.snapshot);
      }
      toast.error(error.response?.data?.message || 'Failed to add favorite');
    },
  });
}

/**
 * Remove a quote from favorites (bookmarks).
 * DELETE /favorites/:id
 * Invalidates both caches. The quote REMAINS in My Quotes.
 */
export function useRemoveQuoteFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favoriteId) => favoriteService.removeFavorite(favoriteId),
    onMutate: async (favoriteId) => {
      await queryClient.cancelQueries({ queryKey: myQuoteKeys.all });
      const snapshot = queryClient.getQueriesData({
        queryKey: myQuoteKeys.lists(),
      });
      queryClient.setQueriesData({ queryKey: myQuoteKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item?.favoriteId === favoriteId
              ? { ...item, favorite: false, favoriteId: null }
              : item
          ),
        };
      });
      return { snapshot };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
      queryClient.invalidateQueries({ queryKey: myQuoteKeys.all });
      toast.success('Removed from favorites 💔');
    },
    onError: (error, _favoriteId, context) => {
      if (context?.snapshot) {
        queryClient.setQueriesData({ queryKey: myQuoteKeys.lists() }, context.snapshot);
      }
      toast.error(error.response?.data?.message || 'Failed to remove favorite');
    },
  });
}

/**
 * Toggle favorite state for a quote.
 * Uses the mutation matching the current state.
 * When un-favoriting without a favoriteId (the history list only exposes a
 * boolean), resolves the favoriteId via GET /favorites/check?quoteId= first.
 */
export function useToggleQuoteFavorite() {
  const addFavorite = useAddQuoteFavoriteMutation();
  const removeFavorite = useRemoveQuoteFavoriteMutation();

  return async ({ quoteId, isFavorite, favoriteId }) => {
    if (isFavorite) {
      let resolvedId = favoriteId;
      if (!resolvedId) {
        const check = await favoriteService.checkFavorite({ quoteId });
        resolvedId = check.data?.favoriteId || null;
      }
      if (!resolvedId) {
        toast.error('Favorite not found');
        return false;
      }
      await removeFavorite.mutateAsync(resolvedId);
    } else {
      await addFavorite.mutateAsync(quoteId);
    }
    return true;
  };
}
