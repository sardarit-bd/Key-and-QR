import { useQuery, useQueryClient } from "@tanstack/react-query";
import dashboardService from "@/services/dashboard-service/dashboard.service";

export const DASHBOARD_KEYS = {
    overview: ["dashboard", "overview"],
};

/**
 * Fetch the complete dashboard overview (single API call)
 */
export function useDashboardOverview() {
    return useQuery({
        queryKey: DASHBOARD_KEYS.overview,
        queryFn: async () => {
            const res = await dashboardService.getOverview();
            return res.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
    });
}

/**
 * Invalidate dashboard cache after mutations
 */
export function useInvalidateDashboard() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.overview });
    };
}
