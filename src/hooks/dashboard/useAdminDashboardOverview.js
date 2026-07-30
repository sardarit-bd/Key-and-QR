import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDashboardService } from '@/services/dashboard-service/admin-dashboard.service';

export const ADMIN_DASHBOARD_KEYS = {
  overview: ['admin-dashboard', 'overview'],
};

/**
 * Fetch the admin dashboard overview from the backend.
 */
export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_KEYS.overview,
    queryFn: async () => {
      const res = await adminDashboardService.getOverview();
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
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
