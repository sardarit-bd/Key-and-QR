import api from "@/lib/api";

/**
 * Favorite Service - Handles all favorite-related API calls
 */
export const favoriteService = {
    /**
     * Get all favorites
     */
    getFavorites: async (params = {}) => {
        const { page = 1, limit = 10 } = params;
        const response = await api.get('/favorites', { params: { page, limit } });
        return response.data;
    },

    /**
     * Check if item is favorite
     */
    checkFavorite: async (productId, quoteId) => {
        const params = {};
        if (productId) params.productId = productId;
        if (quoteId) params.quoteId = quoteId;
        const response = await api.get('/favorites/check', { params });
        return response.data;
    },

    /**
     * Add to favorites
     */
    addFavorite: async (payload) => {
        const response = await api.post('/favorites', payload);
        return response.data;
    },

    /**
     * Remove from favorites
     */
    removeFavorite: async (favoriteId) => {
        const response = await api.delete(`/favorites/${favoriteId}`);
        return response.data;
    },

    /**
     * Remove favorite by reference
     */
    removeFavoriteByReference: async (productId, quoteId) => {
        const response = await api.delete('/favorites/remove-by-reference', {
            data: { productId, quoteId }
        });
        return response.data;
    },

    /**
     * Get favorite stats
     */
    getFavoriteStats: async () => {
        const response = await api.get('/favorites/stats');
        return response.data;
    },
};

export default favoriteService;