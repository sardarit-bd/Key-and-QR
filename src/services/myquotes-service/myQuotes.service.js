import api from '@/lib/api';

/**
 * My Quotes Service
 * Handles all quote-related API calls for the personal library
 */
export const myQuotesService = {
  /**
   * Get user's favorite quotes
   * GET /favorites
   */
  getMyQuotes: async (params = {}) => {
    try {
      const { page = 1, limit = 20, type = 'quote', sortBy = 'createdAt', sortOrder = 'desc', search = '' } = params;
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        type,
        sortBy,
        sortOrder,
        ...(search && { search }),
      });

      const response = await api.get(`/favorites?${queryParams}`);
      
      return {
        success: true,
        data: response.data?.data || [],
        meta: response.data?.meta || {},
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your quotes',
        status: error.response?.status || 500,
        data: [],
        meta: {},
      };
    }
  },

  /**
   * Remove quote from favorites
   * DELETE /favorites/:id
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

  /**
   * Get favorite statistics
   * GET /favorites/stats
   */
  getFavoriteStats: async () => {
    try {
      const response = await api.get('/favorites/stats');
      
      return {
        success: true,
        data: response.data?.data || { total: 0, products: 0, quotes: 0 },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        data: { total: 0, products: 0, quotes: 0 },
        status: error.response?.status || 500,
      };
    }
  },
};

export default myQuotesService;