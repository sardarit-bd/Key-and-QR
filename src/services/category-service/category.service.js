import api from '@/lib/api';

/**
 * Category Service
 * Handles quote category API calls
 * GET /categories (public) — create/update/toggle/delete are admin-only.
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

  /**
   * Fetch categories including inactive ones (admin)
   * GET /categories?includeInactive=true
   */
  getAdminCategories: async ({ page = 1, limit = 10, search = '', isActive } = {}) => {
    const params = { page, limit, includeInactive: 'true' };
    if (search) params.search = search;
    if (isActive !== undefined && isActive !== 'all') params.isActive = isActive;
    const response = await api.get('/categories', { params });
    return response.data; // { meta, data }
  },

  /** Create a new category (admin) */
  createCategory: async (payload) => {
    const response = await api.post('/categories', payload);
    return response.data;
  },

  /** Update a category (admin) */
  updateCategory: async (id, payload) => {
    const response = await api.patch(`/categories/${id}`, payload);
    return response.data;
  },

  /** Toggle a category's active status (admin) */
  toggleCategoryActive: async (id) => {
    const response = await api.patch(`/categories/${id}/toggle`);
    return response.data;
  },

  /** Reorder categories (admin) */
  reorderCategories: async (orderedIds) => {
    const response = await api.patch('/categories/reorder', { orderedIds });
    return response.data;
  },

  /** Upload a custom SVG category icon (admin). Returns { url }. */
  uploadCategoryIcon: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/icon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  /** Hard-delete an unreferenced category (admin) */
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
