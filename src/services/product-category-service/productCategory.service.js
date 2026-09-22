import api from '@/lib/api';

/**
 * Product Category Service
 * Handles physical product category API calls under /product-categories
 */
export const productCategoryService = {
  /**
   * Get all product categories (public/shop)
   * GET /product-categories
   */
  getAllCategories: async (params = {}) => {
    const response = await api.get('/product-categories', { params });
    return response.data; // { success, data, meta }
  },

  /**
   * Get all product categories for Admin (includes inactive)
   * GET /product-categories?includeInactive=true
   */
  getAdminCategories: async (params = {}) => {
    const response = await api.get('/product-categories', {
      params: { includeInactive: true, ...params },
    });
    return response.data;
  },

  /**
   * Get single product category by ID
   * GET /product-categories/:id
   */
  getCategoryById: async (id) => {
    const response = await api.get(`/product-categories/${id}`);
    return response.data;
  },

  /**
   * Create product category (admin)
   * POST /product-categories
   */
  createCategory: async (payload) => {
    const response = await api.post('/product-categories', payload);
    return response.data;
  },

  /**
   * Update product category (admin)
   * PATCH /product-categories/:id
   */
  updateCategory: async (id, payload) => {
    const response = await api.patch(`/product-categories/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle active status (admin)
   * PATCH /product-categories/:id/toggle
   */
  toggleCategoryActive: async (id) => {
    const response = await api.patch(`/product-categories/${id}/toggle`);
    return response.data;
  },

  /**
   * Delete product category (admin)
   * DELETE /product-categories/:id
   */
  deleteCategory: async (id) => {
    const response = await api.delete(`/product-categories/${id}`);
    return response.data;
  },

  /**
   * Reorder product categories (admin)
   * PATCH /product-categories/reorder
   */
  reorderCategories: async (orderedIds) => {
    const response = await api.patch('/product-categories/reorder', { orderedIds });
    return response.data;
  },
};

export default productCategoryService;
