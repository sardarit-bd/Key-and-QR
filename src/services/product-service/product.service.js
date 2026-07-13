import api from "@/lib/api";

/**
 * Product Service - Handles all product-related API calls
 */
export const productService = {
    /**
     * Get all products with filters
     */
    getProducts: async (params = {}) => {
        const { page = 1, limit = 12, search = '', category = '', sort = 'newest' } = params;
        
        const response = await api.get('/products', {
            params: { page, limit, search, category, sort }
        });
        
        return response.data;
    },

    /**
     * Get featured products
     */
    getFeaturedProducts: async (limit = 4) => {
        const response = await api.get('/products', {
            params: { limit, featured: true }
        });
        return response.data;
    },

    /**
     * Get single product by ID
     */
    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    /**
     * Get related products
     */
    getRelatedProducts: async (productId, limit = 4) => {
        const response = await api.get(`/products/${productId}/related`, {
            params: { limit }
        });
        return response.data;
    },

    /**
     * Get product categories
     */
    getCategories: async () => {
        const response = await api.get('/products/categories');
        return response.data;
    },

    /**
     * Search products
     */
    searchProducts: async (query, params = {}) => {
        const response = await api.get('/products/search', {
            params: { q: query, ...params }
        });
        return response.data;
    },
};

export default productService;