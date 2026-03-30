import api from "@/lib/api";

export const authService = {
    register: async (payload) => {
        const res = await api.post("/auth/register", payload);
        return res.data;
    },

    login: async (payload) => {
        const res = await api.post("/auth/login", payload);
        return res.data;
    },

    getMe: async () => {
        const res = await api.get("/auth/me");
        return res.data;
    },

    logout: async () => {
        const res = await api.post("/auth/logout");
        return res.data;
    },

    forgotPassword: async (payload) => {
        const res = await api.post("/auth/forgot-password", payload);
        return res.data;
    },

    resetPassword: async (payload) => {
        const res = await api.post("/auth/reset-password", payload);
        return res.data;
    },

    changePassword: async (payload) => {
        const res = await api.post("/auth/change-password", payload);
        return res.data;
    },

    googleLogin: () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    },
};