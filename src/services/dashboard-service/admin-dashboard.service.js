import api from '@/lib/api';

/**
 * Admin Dashboard Service
 * 
 * Fetches real, aggregated business intelligence and analytics from the backend.
 */
export const adminDashboardService = {
  /**
   * Fetch aggregated overview metrics and time-series chart data.
   * @param {Object} params - { range: 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | '3m' | '1y' | 'custom', startDate, endDate }
   */
  getOverview: async (params = {}) => {
    const response = await api.get('/admin/dashboard/overview', { params });
    return response.data;
  },

  /** Fetch orders stats */
  getOrdersByDate: async ({ days = 30 } = {}) => {
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  /** Fetch recent orders */
  getRecentOrders: async ({ limit = 5 } = {}) => {
    const response = await api.get('/orders/admin/all', {
      params: { page: 1, limit, sort: 'newest' },
    });
    return response.data;
  },
};

export default adminDashboardService;
