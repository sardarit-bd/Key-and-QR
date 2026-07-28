import api from '@/lib/api';
import { MOCK_ADMIN_OVERVIEW } from './mock-admin-data';

/**
 * Admin Dashboard Service
 * 
 * getOverview() returns a single aggregated payload.
 * Set useMock=false once the GET /admin/dashboard/overview endpoint exists.
 */
export const adminDashboardService = {
  getOverview: async ({ useMock = true } = {}) => {
    if (!useMock) {
      const response = await api.get('/admin/dashboard/overview');
      return response.data;
    }

    // Simulate network latency (300–600 ms)
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
    return { data: MOCK_ADMIN_OVERVIEW };
  },
};

export default adminDashboardService;
