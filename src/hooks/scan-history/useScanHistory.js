import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import scanHistoryService from '@/services/scanHistory-service/scanHistory.service';

/**
 * Custom hook for managing scan history
 */
export const useScanHistory = () => {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    uniqueTags: 0,
    categoryDistribution: {},
    lastScan: null,
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Check authentication
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/dashboard/scan-history');
    }
  }, [isInitialized, user, router]);

  /**
   * Fetch scan history
   */
  const fetchHistory = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { page, limit } = pagination;
      
      const result = await scanHistoryService.getScanHistory({
        page,
        limit,
        search,
        category: category !== 'all' ? category : '',
        sortBy: 'createdAt',
        sortOrder: sort === 'newest' ? 'desc' : 'asc',
      });

      if (result.success) {
        setHistory(result.data || []);
        setPagination(prev => ({
          ...prev,
          total: result.meta?.total || 0,
          totalPages: result.meta?.totalPage || 0,
        }));
      } else {
        setError(result.message);
        setHistory([]);
      }
    } catch (err) {
      setError('Failed to load scan history. Please try again.');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.page, pagination.limit, search, category, sort]);

  /**
   * Fetch scan statistics
   */
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const result = await scanHistoryService.getScanStats();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch scan stats:', err);
    }
  }, [user]);

  /**
   * View scan detail
   */
  const viewDetail = useCallback((item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  /**
   * Close detail modal
   */
  const closeDetail = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItem(null);
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
      fetchHistory();
      fetchStats();
    }
  }, [user, isInitialized, fetchHistory, fetchStats]);

  // Refetch on filter/sort/page change
  useEffect(() => {
    if (user && isInitialized) {
      fetchHistory();
    }
  }, [search, category, sort, pagination.page, user, isInitialized, fetchHistory]);

  return {
    history,
    loading,
    error,
    stats,
    search,
    category,
    sort,
    pagination,
    selectedItem,
    isModalOpen,
    setSearch: handleSearch,
    setCategory: handleCategoryChange,
    setSort: handleSortChange,
    handlePageChange,
    viewDetail,
    closeDetail,
    resetFilters,
    fetchHistory,
    isAuthenticated: !!user,
  };
};

export default useScanHistory;