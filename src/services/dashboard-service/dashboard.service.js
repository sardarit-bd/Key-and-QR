import api from "@/lib/api";

export const dashboardService = {
    /**
     * GET /dashboard/overview — single aggregated endpoint
     */
    getOverview: async () => {
        const response = await api.get("/dashboard/overview");
        return response.data;
    },
};

export default dashboardService;
