import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useFavoriteStore } from '@/store/favoriteStore';
import myQuotesService from '@/services/myquotes-service/myQuotes.service';

/**
 * Custom hook for managing user's saved quotes
 */
export const useMyQuotes = () => {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { favorites, setFavorites, updateStats, stats: storeStats } = useFavoriteStore();
  
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [view, setView] = useState('grid');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    quotes: 0,
    categories: 0,
    recentlyAdded: 0,
  });

  // Check authentication
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/new-dashboard/user/my-quotes');
    }
  }, [isInitialized, user, router]);

  /**
   * Fetch user's quotes
   */
  const fetchQuotes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { page, limit } = pagination;
      
      const result = await myQuotesService.getMyQuotes({
        page,
        limit,
        type: 'quote',
        sortBy: sort === 'newest' ? 'createdAt' : sort === 'oldest' ? 'createdAt' : 'text',
        sortOrder: sort === 'newest' ? 'desc' : sort === 'oldest' ? 'asc' : 'asc',
        search,
      });

      if (result.success) {
        // Always ensure data is an array
        const rawData = Array.isArray(result.data) ? result.data : [];
        
        // Sync with favorite store
        setFavorites(rawData);
        
        // Filter by category if needed
        let filteredData = rawData;
        if (category !== 'all') {
          filteredData = rawData.filter((item) => {
            const cat = item.quote?.category?.toLowerCase();
            return cat === category.toLowerCase();
          });
        }

        // Update pagination
        const total = result.meta?.total ?? rawData.length;
        const totalPages = result.meta?.totalPage ?? Math.ceil(total / limit);
        
        setPagination(prev => ({
          ...prev,
          total,
          totalPages,
        }));

        setQuotes(filteredData);
      } else {
        setError(result.message);
        setQuotes([]);
      }
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError('Failed to load your quotes. Please try again.');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.page, pagination.limit, search, category, sort, setFavorites]);

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const result = await myQuotesService.getFavoriteStats();
      
      if (result.success) {
        const statsData = result.data || {};
        
        // Update store stats
        updateStats({
          total: statsData.total || 0,
          products: statsData.products || 0,
          quotes: statsData.quotes || 0,
        });
        
        // Calculate additional stats
        const quotesCount = statsData.quotes || 0;
        const categoriesCount = 5;
        const recentlyAdded = quotesCount > 0 ? Math.min(3, quotesCount) : 0;

        setStats({
          total: statsData.total || 0,
          quotes: quotesCount,
          categories: categoriesCount,
          recentlyAdded,
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user, updateStats]);

  /**
   * Remove a quote from favorites
   */
  const removeQuote = useCallback(async (favoriteId) => {
    if (!favoriteId) return false;

    try {
      const result = await myQuotesService.removeFavorite(favoriteId);
      
      if (result.success) {
        // Remove from local state
        setQuotes(prev => prev.filter(item => item._id !== favoriteId));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit),
        }));
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          quotes: prev.quotes - 1,
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to remove quote:', err);
      return false;
    }
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  /**
   * Handle search
   */
  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Handle category change
   */
  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((value) => {
    setSort(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Handle view change
   */
  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setSort('newest');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (user && isInitialized) {
      fetchQuotes();
      fetchStats();
    }
  }, [user, isInitialized, fetchQuotes, fetchStats]);

  // Refetch on filter/sort/page change
  useEffect(() => {
    if (user && isInitialized) {
      fetchQuotes();
    }
  }, [search, category, sort, pagination.page, user, isInitialized, fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    search,
    category,
    sort,
    view,
    pagination,
    stats,
    storeStats,
    setSearch: handleSearch,
    setCategory: handleCategoryChange,
    setSort: handleSortChange,
    setView: handleViewChange,
    handlePageChange,
    removeQuote,
    resetFilters,
    fetchQuotes,
    isAuthenticated: !!user,
  };
};

export default useMyQuotes;
