import api from "@/lib/api";

export const subscriptionService = {
    getPlans: async () => {
        const response = await api.get("/subscriptions/plans");
        return response.data;
    },

    getMySubscriptions: async () => {
        const response = await api.get("/subscriptions/me");
        return response.data;
    },

    createCheckout: async (tagCode, preferredCategory) => {
        const response = await api.post("/subscriptions/checkout", {
            tagCode,
            preferredCategory,
        });
        return response.data;
    },

    cancelSubscription: async (tagCode) => {
        const response = await api.post("/subscriptions/cancel", { tagCode });
        return response.data;
    },
};

