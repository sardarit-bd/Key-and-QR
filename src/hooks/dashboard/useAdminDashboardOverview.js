import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDashboardService } from '@/services/dashboard-service/admin-dashboard.service';

export const ADMIN_DASHBOARD_KEYS = {
  overview: ['admin-dashboard', 'overview'],
};

/**
 * Fetch the admin dashboard overview.
 * Defaults to mock data when the backend endpoint is unavailable — 
 * swap to a real API call by updating adminDashboardService.getOverview().
 */
export function useAdminDashboardOverview(options = {}) {
  const { useMock = true } = options;

  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEYS.overview,
    queryFn: async () => {
      const res = await adminDashboardService.getOverview({ useMock });
      return res.data;
    },
    staleTime: 30 * 1000, // 30 seconds for admin data
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true, // Admin wants fresh data
  });
}

/**
 * Invalidate admin dashboard cache after relevant mutations.
 */
export function useInvalidateAdminDashboard() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_KEYS.overview });
  };
}
