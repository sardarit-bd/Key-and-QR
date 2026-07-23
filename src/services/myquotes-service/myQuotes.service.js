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
      
      // Normalize response — handle all possible shapes:
      // - []
      // - { data: [] }
      // - { data: { quotes: [] } }
      // - { success: true, data: [...] }
      const raw = response.data;
      const dataList = normalizeData(raw?.data);
      const meta = normalizeMeta(raw?.meta, dataList.length);
      
      return {
        success: true,
        data: dataList,
        meta,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your quotes',
        status: error.response?.status || 500,
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPage: 0 },
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

/**
 * Normalize API data response to always return an array.
 * Handles: [], { data: [] }, { data: { quotes: [] } }, { success: true, data: [...] }
 */
function normalizeData(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    // { data: { quotes: [...] } }
    if (Array.isArray(raw.quotes)) return raw.quotes;
    // { data: { data: [...] } }
    if (Array.isArray(raw.data)) return raw.data;
  }
  return [];
}

/**
 * Normalize meta response to always return pagination info.
 */
function normalizeMeta(raw, fallbackTotal = 0) {
  if (raw && typeof raw === 'object') {
    return {
      page: raw.page || 1,
      limit: raw.limit || 20,
      total: raw.total ?? fallbackTotal,
      totalPage: raw.totalPage ?? Math.ceil(fallbackTotal / (raw.limit || 20)),
    };
  }
  return {
    page: 1,
    limit: 20,
    total: fallbackTotal,
    totalPage: Math.ceil(fallbackTotal / 20),
  };
}

export default myQuotesService;
