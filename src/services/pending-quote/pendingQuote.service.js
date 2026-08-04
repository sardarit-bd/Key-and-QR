import api from '@/lib/api';

/**
 * Pending Quote Service
 * Handles user quote submissions and submission history.
 */
export const pendingQuoteService = {
  /**
   * Submit a quote for review.
   * POST /pending-quotes/submit
   */
  submitQuote: async (payload) => {
    try {
      const response = await api.post('/pending-quotes/submit', payload);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit quote',
        status: error.response?.status || 500,
        error: error.response?.data || null,
      };
    }
  },

  /**
   * Get the user's submission history (paginated + filterable).
   * GET /pending-quotes/my-quotes?page&limit&search&category&status&sortBy
   */
  getMySubmissions: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        category = 'all',
        status = 'all',
        sortBy = 'newest',
      } = params;

      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.set('search', search);
      if (category && category !== 'all') queryParams.set('category', category);
      if (status && status !== 'all') queryParams.set('status', status);
      if (sortBy && sortBy !== 'newest') queryParams.set('sortBy', sortBy);

      const response = await api.get(`/pending-quotes/my-quotes?${queryParams}`);

      return {
        success: true,
        data: Array.isArray(response.data?.data) ? response.data.data : [],
        meta: response.data?.meta || { page: 1, limit, total: 0, totalPage: 0 },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load submissions',
        status: error.response?.status || 500,
        data: [],
        meta: { page: 1, limit, total: 0, totalPage: 0 },
      };
    }
  },
};

export default pendingQuoteService;
