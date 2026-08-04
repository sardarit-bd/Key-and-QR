import api from '@/lib/api';

/**
 * Received Quote Service
 * Handles the dashboard quote receive engine API calls
 * GET/POST /received-quotes/*
 */
export const receivedQuoteService = {
  /**
   * Receive a quote for a category (dashboard quote engine)
   * POST /received-quotes/receive
   */
  receive: async (categorySlug) => {
    try {
      const response = await api.post('/received-quotes/receive', {
        categorySlug,
      });
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to receive quote',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Get latest received quote
   * GET /received-quotes/latest
   */
  getLatest: async () => {
    try {
      const response = await api.get('/received-quotes/latest');
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load latest quote',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Get received quote history
   * GET /received-quotes/history
   */
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/received-quotes/history', { params });
      return {
        success: true,
        data: response.data?.data || [],
        meta: response.data?.meta || {},
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load history',
        status: error.response?.status || 500,
        data: [],
        meta: {},
      };
    }
  },

  /**
   * Read a received quote again
   * GET /received-quotes/:id/read
   * Side-effect free: does NOT increase streak, does NOT consume daily usage,
   * does NOT create new history.
   */
  readAgain: async (receivedQuoteId) => {
    try {
      const response = await api.get(`/received-quotes/${receivedQuoteId}/read`);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load quote',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },
};

export default receivedQuoteService;
