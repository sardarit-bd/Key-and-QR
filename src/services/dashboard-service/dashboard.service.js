import api from "@/lib/api";

export const dashboardService = {
    /**
     * GET /dashboard/home — single aggregated endpoint
     * (quote receive engine: latestInspiration, dailyUsage, streak,
     * categories with lock state, statistics, favorite count)
     */
    getOverview: async () => {
        const response = await api.get("/dashboard/home");
        return response.data;
    },
};

export default dashboardService;
