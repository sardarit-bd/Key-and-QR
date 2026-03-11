import api from "@/services/api";
import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: false,
    error: null,

    // Register User
    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post("/auth/register", userData);
            const { accessToken, user } = response.data.data;

            localStorage.setItem("accessToken", accessToken);
            set({ user, loading: false, error: null });

            return user;
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            set({ error: message, loading: false });
            return null;
        }
    },

    // Login User
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post("/auth/login", credentials);
            const { accessToken, user } = response.data.data;

            localStorage.setItem("accessToken", accessToken);

            // **FIXED: Cookies properly set**
            // authToken cookie
            document.cookie = `authToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;

            // role cookie - IMPORTANT for middleware
            document.cookie = `role=${user.role}; path=/; max-age=86400; SameSite=Strict`;

            console.log("Cookies set:", document.cookie); // Debug log

            set({ user, loading: false, error: null });

            return user;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            set({ error: message, loading: false });
            return null;
        }
    },

    // Get Current User (Me)
    getMe: async () => {
        set({ loading: true });
        try {
            const response = await api.get("/auth/me");
            const user = response.data.data;

            set({ user, loading: false });
            return user;
        } catch (error) {
            set({ user: null, loading: false });
            return null;
        }
    },

    // Forgot Password
    forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
            await api.post("/auth/forgot-password", { email });
            set({ loading: false, error: null });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong";
            set({ error: message, loading: false });
            return false;
        }
    },

    // Reset Password
    resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });
        try {
            await api.post("/auth/reset-password", { token, newPassword });
            set({ loading: false, error: null });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Password reset failed";
            set({ error: message, loading: false });
            return false;
        }
    },

    // Change Password
    changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
            await api.post("/auth/change-password", { oldPassword, newPassword });
            set({ loading: false, error: null });
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Password change failed";
            set({ error: message, loading: false });
            return false;
        }
    },

    // Logout
    logout: async () => {
        set({ loading: true });
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("accessToken");

            // Clear cookies
            document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
            document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

            set({ user: null, loading: false });
        }
    },

    // Check Auth Status on App Load
    checkAuth: async () => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            await get().getMe();
        }
    },
}));