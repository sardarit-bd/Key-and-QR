"use client";

import { authService } from "@/services/auth.service";
import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    if (get().isInitialized) return;

    set({ loading: true, error: null });

    try {
      const res = await authService.getMe();
      console.log("Initialize auth response:", res);

      set({
        user: res.data,
        loading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      console.error("Initialize auth error:", error);
      set({
        user: null,
        loading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });

    try {
      const res = await authService.register(payload);

      set({
        user: res.data?.user || res.data,
        loading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true, user: res.data?.user || res.data };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });

    try {
      const res = await authService.login(payload);

      set({
        user: res.data?.user || res.data,
        loading: false,
        error: null,
        isInitialized: true,
      });

      return { success: true, user: res.data?.user || res.data };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  fetchMe: async () => {
    try {
      const res = await authService.getMe();
      set({
        user: res.data,
        isInitialized: true,
        error: null,
      });
      return res.data;
    } catch (error) {
      set({
        user: null,
        isInitialized: true,
      });
      return null;
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

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // ignore logout api error
    } finally {
      set({
        user: null,
        isInitialized: true,
        error: null,
      });
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });

    try {
      const res = await authService.forgotPassword({ email });
      set({ loading: false });
      return { success: true, message: res.message };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ loading: true, error: null });

    try {
      const res = await authService.resetPassword({ token, newPassword });
      set({ loading: false });
      return { success: true, message: res.message };
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set({ loading: true, error: null });

    try {
      const res = await authService.changePassword({ oldPassword, newPassword });
      set({ loading: false });
      return { success: true, message: res.message };
    } catch (error) {
      const message = error.response?.data?.message || "Password change failed";
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },
}));