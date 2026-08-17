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

    createCheckout: async (tagCode = null, preferredCategory = null) => {
        const payload = {};
        if (tagCode) payload.tagCode = tagCode;
        if (preferredCategory) payload.preferredCategory = preferredCategory;
        const response = await api.post("/subscriptions/checkout", payload);
        return response.data;
    },

    cancelSubscription: async (tagCode) => {
        const response = await api.post("/subscriptions/cancel", { tagCode });
        return response.data;
    },

    createPortalSession: async () => {
        const response = await api.post("/subscriptions/create-portal-session");
        return response.data;
    },

    getLatestInvoice: async () => {
        const response = await api.get("/subscriptions/latest-invoice");
        return response.data;
    },
};

