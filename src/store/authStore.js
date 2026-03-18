import api from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      setAccessToken: (token) => set({ accessToken: token }),

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/register", userData);
          const { accessToken, user } = response.data.data;
          set({ accessToken, user, isLoading: false, error: null });
          return user;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Registration failed",
          });
          return null;
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post("/auth/login", credentials);
          const { accessToken, user } = response.data.data;
          set({ accessToken, user, isLoading: false, error: null });
          return user;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Login failed",
          });
          return null;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        }
      },

      initAuth: async () => {
        if (get().isInitialized) return;

        const token = get().accessToken;

        // token নেই — refresh token দিয়ে try করো
        if (!token) {
          try {
            const refreshResponse = await api.post("/auth/refresh-token", {});
            const { accessToken } = refreshResponse.data.data;
            set({ accessToken });

            const meResponse = await api.get("/auth/me");
            set({
              user: meResponse.data.data,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          } catch {
            set({ isInitialized: true, isLoading: false });
          }
          return;
        }

        // token আছে — /me দিয়ে user fetch করো
        set({ isLoading: true });
        try {
          const response = await api.get("/auth/me");
          set({
            user: response.data.data,
            isLoading: false,
            isInitialized: true,
            error: null,
          });
        } catch {
          // access token expire — refresh দিয়ে try করো
          try {
            const refreshResponse = await api.post("/auth/refresh-token", {});
            const { accessToken } = refreshResponse.data.data;
            set({ accessToken });

            const meResponse = await api.get("/auth/me");
            set({
              user: meResponse.data.data,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          } catch {
            set({
              user: null,
              accessToken: null,
              isLoading: false,
              isInitialized: true,
              error: null,
            });
          }
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/forgot-password", { email });
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to send reset email",
          });
          return false;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/reset-password", { token, newPassword });
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to reset password",
          });
          return false;
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await api.post("/auth/change-password", { oldPassword, newPassword });
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to change password",
          });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    },
  ),
);

export const authStore = useAuthStore;
