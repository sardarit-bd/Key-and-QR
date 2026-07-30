import api from '@/lib/api';

/**
 * Admin Products Service
 *
 * Integrates with the existing backend product APIs.
 * No mock data — communicates with real backend endpoints.
 *
 * Backend GET /products supports:
 *   - search: $regex on name, category, brand (OR across fields)
 *   - trash: boolean (when true, returns isActive:false)
 * No dedicated category filter exists on the backend.
 * Category filtering with text search is handled by prepending
 * the category to the search term only when no text search is active.
 */
export const adminProductsService = {
  /** Fetch paginated products */
  getProducts: async ({ page = 1, limit = 10, search = '', category = '', status = 'active' } = {}) => {
    const params = { page, limit };

    // Backend GET /products only knows `search` (text regex) and `trash` (boolean).
    // Category is NOT a query param on the backend — it's searched via $regex.
    // Strategy:
    //   - If there's a text search AND a category filter: send both as search text
    //     so the backend's $regex matches either field (name, category, or brand).
    //   - If there's ONLY a category filter and no text search: send the category
    //     as the search term so $regex matches it against the category field.
    //   - If category is 'all' or empty: don't send it.
    if (search || (category && category !== 'all')) {
      const terms = [];
      if (search) terms.push(search);
      if (category && category !== 'all') terms.push(category);
      params.search = terms.join(' ');
    }

    // Status handling: 'active' (default, isActive:true), 'inactive' (trash:true)
    if (status === 'inactive') {
      params.trash = true;
    }

    const response = await api.get('/products', { params });
    return response.data;
  },

  /** Fetch available categories */
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  /** Fetch single product by ID */
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /** Create a new product (multipart/form-data) */
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Update an existing product (multipart/form-data) */
  updateProduct: async (id, formData) => {
    const response = await api.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Soft delete — moves to trash */
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  /** Restore from trash */
  restoreProduct: async (id) => {
    const response = await api.patch(`/products/restore/${id}`);
    return response.data;
  },

  /** Permanently delete */
  permanentDeleteProduct: async (id) => {
    const response = await api.delete(`/products/permanent/${id}`);
    return response.data;
  },
};

export default adminProductsService;
