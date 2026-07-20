import api from '@/lib/api';

/**
 * QR Service - Handles all QR-related API calls
 */
export const qrService = {
  /**
   * Resolve QR code
   * GET /tags/resolve/:tagCode
   */
  resolveTag: async (tagCode) => {
    try {
      const response = await api.get(`/tags/resolve/${tagCode}`);
      
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || 'Failed to resolve QR code';
      const data = error.response?.data?.data || null;
      const code = error.response?.data?.code || null;
      
      return {
        success: false,
        status,
        message,
        data,
        code,
      };
    }
  },

  /**
   * Add to favorites
   * POST /favorites
   */
  addFavorite: async (quoteId) => {
    try {
      const response = await api.post('/favorites', { quoteId });
      
      return {
        success: true,
        data: response.data?.data || null,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add favorite',
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Check if quote is in favorites
   * GET /favorites/check?quoteId=xxx
   */
  checkFavorite: async (quoteId) => {
    try {
      const response = await api.get(`/favorites/check?quoteId=${quoteId}`);
      
      return {
        success: true,
        data: response.data?.data || { exists: false, favoriteId: null },
      };
    } catch (error) {
      return {
        success: false,
        data: { exists: false, favoriteId: null },
      };
    }
  },
};

export default qrService;