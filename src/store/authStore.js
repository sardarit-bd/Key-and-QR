"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      isInitialized: false,
      error: null,

      initializeAuth: async () => {
        const state = get();
        
        if (state.isInitialized) return;
        if (state.loading) return;
        
        set({ loading: true });
        
        try {
          const response = await api.get("/auth/me");
          const user = response.data?.data;
          
          if (user) {
            set({ user, isInitialized: true, loading: false, error: null });
            return;
          }
        } catch (error) {
          console.error("Init auth error:", error);
          
          // Don't try refresh on login page
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            set({ user: null, isInitialized: true, loading: false });
            return;
          }
          
          // Try refresh token
          try {
            const refreshResponse = await api.post("/auth/refresh-token");
            
            if (refreshResponse.data?.success) {
              const userResponse = await api.get("/auth/me");
              const user = userResponse.data?.data;
              set({ user, isInitialized: true, loading: false, error: null });
              return;
            }
          } catch (refreshError) {
            console.error("Refresh failed:", refreshError);
          }
        }
        
        set({ user: null, isInitialized: true, loading: false });
      },

      fetchMe: async () => {
        try {
          const response = await api.get("/auth/me");
          const user = response.data?.data ?? null;
          set({ user, error: null });
          return user;
        } catch (error) {
          set({ user: null, error: null });
          return null;
        }
      },

      register: async (payload) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/register", payload);
          const user = response.data?.data?.user ?? null;
          const accessToken = response.data?.data?.accessToken;
          
          if (accessToken && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }

          set({ user, loading: false, error: null, isInitialized: true });
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || "Registration failed";
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      login: async (payload) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/login", payload);
          const user = response.data?.data?.user;
          const accessToken = response.data?.data?.accessToken;
          
          if (accessToken && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', accessToken);
          }

          set({ user, loading: false, error: null, isInitialized: true });
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.message || "Login failed";
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        set({ loading: true });

        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          if (typeof window !== "undefined") {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
          
          set({ user: null, isInitialized: true, error: null, loading: false });
          
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/forgot-password", { email });
          set({ loading: false });
          return { success: true, message: response.data?.message || "Reset email sent" };
        } catch (error) {
          const message = error.response?.data?.message || "Failed to send reset email";
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/reset-password", { token, newPassword });
          set({ loading: false });
          return { success: true, message: response.data?.message || "Password reset successfully" };
        } catch (error) {
          const message = error.response?.data?.message || "Password reset failed";
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });

        try {
          const response = await api.post("/auth/change-password", { oldPassword, newPassword });
          set({ loading: false });
          return { success: true, message: response.data?.message || "Password changed successfully" };
        } catch (error) {
          const message = error.response?.data?.message || "Password change failed";
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : null,
        }));
      },

      updateUserPartial: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      isAuthenticated: () => !!get().user,
      isAdmin: () => get().user?.role === "admin",
      getUser: () => get().user,
    }),
    {
      name: 'auth-storage',
      getStorage: () => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      },
      partialize: (state) => ({ 
        user: state.user,
        isInitialized: state.isInitialized 
      }),
    }
  )
);