import api from '@/lib/api';

/**
 * Category Service
 * Handles quote category API calls
 * GET /categories
 */
export const categoryService = {
  /**
   * Get all active categories
   * GET /categories
   */
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get('/categories', { params });
      return {
        success: true,
        data: response.data?.data || [],
        meta: response.data?.meta || {},
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load categories',
        status: error.response?.status || 500,
        data: [],
        meta: {},
      };
    }
  },
};

export default categoryService;
