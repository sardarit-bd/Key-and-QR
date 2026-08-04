import api from '@/lib/api';

/**
 * My Quotes Service
 * Handles all quote-library API calls for the personal library.
 *
 * "My Quotes" is the user's COMPLETE quote library (all received quotes),
 * served by the received-quotes API — NOT the favorites API.
 * Favorites (bookmarked quotes) is a separate concept served by /favorites.
 */
export const myQuotesService = {
  /**
   * Get the user's complete quote library.
   * GET /received-quotes/history
   * Each item is a ReceivedQuote doc:
   * { _id, quote: {_id,text,author,category,description,image,theme},
   *   category: {_id,name,slug,icon,color}, categorySlug, receivedAt,
   *   source, dayKey, isRead, favorite, metadata }
   */
  getMyQuotes: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        category = '',
        source = '',
      } = params;

      const queryParams = new URLSearchParams({
        page,
        limit,
      });
      if (category) queryParams.set('category', category);
      if (source) queryParams.set('source', source);

      const response = await api.get(`/received-quotes/history?${queryParams}`);

      return {
        success: true,
        data: Array.isArray(response.data?.data) ? response.data.data : [],
        meta: response.data?.meta || {},
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your quotes',
        status: error.response?.status || 500,
        data: [],
        meta: { page: 1, limit: 12, total: 0, totalPage: 0 },
      };
    }
  },

  /**
   * Get quote library statistics.
   * GET /received-quotes/statistics
   * Returns { totalQuotes, favorites, unread, today, categoryDistribution }
   */
  getMyQuoteStats: async () => {
    try {
      const response = await api.get('/received-quotes/statistics');

      return {
        success: true,
        data: response.data?.data || {
          totalQuotes: 0,
          favorites: 0,
          unread: 0,
          today: 0,
          categoryDistribution: [],
        },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quote statistics',
        status: error.response?.status || 500,
        data: {
          totalQuotes: 0,
          favorites: 0,
          unread: 0,
          today: 0,
          categoryDistribution: [],
        },
      };
    }
  },

  /**
   * Remove a quote from favorites (bookmarks).
   * DELETE /favorites/:id
   * NOTE: This only removes the bookmark. The quote stays in the library.
   */
  removeFavorite: async (favoriteId) => {
    try {
      const response = await api.delete(`/favorites/${favoriteId}`);

      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove from favorites',
        status: error.response?.status || 500,
      };
    }
  },
};

export default myQuotesService;
