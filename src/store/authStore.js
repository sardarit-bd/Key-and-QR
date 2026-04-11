"use client";

import { create } from "zustand";
import api from "@/lib/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    if (get().loading || get().isInitialized) return;

    set({ loading: true, error: null });

    try {
      const response = await api.get("/auth/me");
      const user = response.data?.data ?? null;

      set({
        user,
        loading: false,
        isInitialized: true,
        error: null,
      });

      return user;
    } catch (error) {
      set({
        user: null,
        loading: false,
        isInitialized: true,
        error: null,
      });

      return null;
    }
  },

  fetchMe: async () => {
    try {
      const response = await api.get("/auth/me");
      const user = response.data?.data ?? null;

      set({
        user,
        isInitialized: true,
        error: null,
      });

      return user;
    } catch (error) {
      set({
        user: null,
        isInitialized: true,
        error: null,
      });

      return null;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/register", payload);
      const user = response.data?.data?.user ?? null;

      set({
        user,
        loading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";

      set({
        loading: false,
        error: message,
      });

      return { success: false, error: message };
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/login", payload);
      const user = response.data?.data?.user ?? null;

      console.log('Login response:', {
        status: response.status,
        user: user?.email,
        headers: response.headers,
      });

      // ✅ Check if cookies were set
      const cookies = document.cookie;
      console.log('Cookies after login:', cookies);

      if (!cookies.includes('accessToken')) {
        console.warn('⚠️ No accessToken cookie found!');
      }

      set({
        user,
        loading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || "Login failed";

      set({
        loading: false,
        error: message,
      });

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
      set({
        user: null,
        isInitialized: true,
        error: null,
        loading: false,
      });

      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/forgot-password", { email });

      set({ loading: false });

      return {
        success: true,
        message: response.data?.message || "Reset email sent",
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send reset email";

      set({
        loading: false,
        error: message,
      });

      return { success: false, error: message };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      set({ loading: false });

      return {
        success: true,
        message: response.data?.message || "Password reset successfully",
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Password reset failed";

      set({
        loading: false,
        error: message,
      });

      return { success: false, error: message };
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set({ loading: true, error: null });

    try {
      const response = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      set({ loading: false });

      return {
        success: true,
        message: response.data?.message || "Password changed successfully",
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Password change failed";

      set({
        loading: false,
        error: message,
      });

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
}));