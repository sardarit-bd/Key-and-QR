import api from '@/lib/api';

/**
 * Admin Dashboard Service
 * 
 * Fetches aggregated admin dashboard data from the backend.
 */
export const adminDashboardService = {
  getOverview: async () => {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
  },

  /** Fetch orders by date for charting */
  getOrdersByDate: async ({ days = 30 } = {}) => {
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  /** Fetch recent orders for the overview */
  getRecentOrders: async ({ limit = 5 } = {}) => {
    const response = await api.get('/orders/admin/all', {
      params: { page: 1, limit, sort: 'newest' },
    });
    return response.data;
  },
};

export default adminDashboardService;
