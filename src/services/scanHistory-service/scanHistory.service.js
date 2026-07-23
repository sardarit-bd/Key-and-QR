import api from '@/lib/api';

/**
 * Scan History Service
 * Handles all scan history API calls
 */
export const scanHistoryService = {
  /**
   * Get user scan history
   * GET /scan/history
   */
  getScanHistory: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(category && { category }),
        sortBy,
        sortOrder,
      });

      const response = await api.get(`/scan/history?${queryParams}`);
      
      return {
        success: true,
        data: response.data?.data || [],
        meta: response.data?.meta || {},
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch scan history',
        status: error.response?.status || 500,
        data: [],
        meta: {},
      };
    }
  },

  /**
   * Get user scan statistics
   * GET /scan/stats
   */
  getScanStats: async () => {
    try {
      const response = await api.get('/scan/stats');
      
      return {
        success: true,
        data: response.data?.data || {
          totalScans: 0,
          todayScans: 0,
          uniqueTags: 0,
          categoryDistribution: {},
          lastScan: null,
        },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch scan stats',
        status: error.response?.status || 500,
        data: {
          totalScans: 0,
          todayScans: 0,
          uniqueTags: 0,
          categoryDistribution: {},
          lastScan: null,
        },
      };
    }
  },

  /**
   * Get scan detail by ID
   * GET /scan/:id (if available)
   */
  getScanDetail: async (scanId) => {
    try {
      const response = await api.get(`/scan/${scanId}`);
      
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      // If detail endpoint doesn't exist, return null
      return {
        success: false,
        data: null,
        status: error.response?.status || 404,
      };
    }
  },
};

export default scanHistoryService;