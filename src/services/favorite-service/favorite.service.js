import api from '@/lib/api';

/**
 * Favorite Service
 * Handles all favorite-related API calls
 */
export const favoriteService = {
  /**
   * Add to favorites
   * POST /favorites
   */
  addFavorite: async (payload) => {
    try {
      const response = await api.post('/favorites', payload);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to favorites',
        status: error.response?.status || 500,
        error: error.response?.data || null,
      };
    }
  },

  /**
   * Remove from favorites
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
        error: error.response?.data || null,
      };
    }
  },

  /**
   * Check if item is favorited
   * GET /favorites/check
   */
  checkFavorite: async (params) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/favorites/check?${queryParams}`);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        data: { exists: false, favoriteId: null },
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Get user's favorites
   * GET /favorites
   */
  getFavorites: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
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
        message: error.response?.data?.message || 'Failed to fetch favorites',
        status: error.response?.status || 500,
        data: [],
        meta: {},
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

  /**
   * Batch add favorites
   * POST /favorites/batch
   */
  batchAddFavorites: async (items) => {
    try {
      const response = await api.post('/favorites/batch', { items });
      return {
        success: true,
        data: response.data?.data || [],
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add favorites',
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Check multiple favorites at once
   * POST /favorites/check-batch
   */
  checkMultipleFavorites: async (items) => {
    try {
      const response = await api.post('/favorites/check-batch', { items });
      return {
        success: true,
        data: response.data?.data || [],
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        status: error.response?.status || 500,
      };
    }
  },
};

export default favoriteService;