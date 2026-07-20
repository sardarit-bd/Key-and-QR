/**
 * Favorite Utility Functions
 */

/**
 * Check if item is favorited
 */
export const isItemFavorited = (favorites, id) => {
    if (!favorites || !id) return false;
    return favorites.some(fav => 
      fav.quote?._id === id || 
      fav.product?._id === id
    );
  };
  
  /**
   * Get favorite ID for item
   */
  export const getFavoriteId = (favorites, id) => {
    if (!favorites || !id) return null;
    const favorite = favorites.find(fav => 
      fav.quote?._id === id || 
      fav.product?._id === id
    );
    return favorite?._id || null;
  };
  
  /**
   * Get favorite statistics
   */
  export const getFavoriteStats = (favorites) => {
    if (!favorites) return { total: 0, products: 0, quotes: 0 };
    
    const total = favorites.length;
    const quotes = favorites.filter(fav => fav.type === 'quote').length;
    const products = favorites.filter(fav => fav.type === 'product').length;
    
    return { total, quotes, products };
  };
  
  /**
   * Group favorites by category
   */
  export const groupFavoritesByCategory = (favorites) => {
    if (!favorites) return {};
    
    return favorites.reduce((acc, fav) => {
      const category = fav.quote?.category || 'uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(fav);
      return acc;
    }, {});
  };
  
  /**
   * Sort favorites
   */
  export const sortFavorites = (favorites, sortBy = 'newest') => {
    if (!favorites) return [];
    
    const sorted = [...favorites];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'alphabetical':
        return sorted.sort((a, b) => 
          (a.quote?.text || '').localeCompare(b.quote?.text || '')
        );
      default:
        return sorted;
    }
  };
  
  /**
   * Search favorites
   */
  export const searchFavorites = (favorites, query) => {
    if (!favorites || !query) return favorites;
    
    const searchLower = query.toLowerCase();
    return favorites.filter(fav => {
      const text = fav.quote?.text?.toLowerCase() || '';
      const author = fav.quote?.author?.toLowerCase() || '';
      const category = fav.quote?.category?.toLowerCase() || '';
      return text.includes(searchLower) || 
             author.includes(searchLower) || 
             category.includes(searchLower);
    });
  };