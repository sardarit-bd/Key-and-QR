"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { setTokens, clearTokens, setUser, getUser, getAccessToken, getRefreshToken } from "@/lib/api";

const filterUserData = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage?.url || user.profileImage || null,
    provider: user.provider,
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      isInitialized: false,
      error: null,

      // Update the initializeAuth function in authStore.js

      initializeAuth: async () => {
        const state = get();
        if (state.isInitialized) return;
        if (state.loading) return;

        const storedUser = getUser();
        const storedToken = getAccessToken();

        // 🔥 If we have user and token in localStorage, just use them
        if (storedUser && storedToken) {
          console.log("🟢 Using stored user from localStorage");
          const filteredUser = filterUserData(storedUser);
          set({ user: filteredUser, isInitialized: true, loading: false });

          // 🔥 Verify token in background (don't wait for it)
          api.get("/auth/me").then(response => {
            const freshUser = response.data?.data;
            if (freshUser) {
              const filteredFreshUser = filterUserData(freshUser);
              setUser(filteredFreshUser);
              set({ user: filteredFreshUser });
            }
          }).catch(() => {
            console.log("Background verification failed, but user stays logged in");
          });
          return;
        }

        // No stored user, try to fetch
        set({ loading: true });
        try {
          const response = await api.get("/auth/me");
          const user = response.data?.data;
          if (user) {
            const filteredUser = filterUserData(user);
            setUser(filteredUser);
            set({ user: filteredUser, isInitialized: true, loading: false, error: null });
            return;
          }
        } catch (error) {
          console.error("Init auth error:", error);
        }

        set({ user: null, isInitialized: true, loading: false });
      },

      // ... rest of your store functions remain the same
      fetchMe: async () => {
        try {
          const response = await api.get("/auth/me");
          const user = response.data?.data ?? null;
          if (user) {
            const filteredUser = filterUserData(user);
            setUser(filteredUser);
            set({ user: filteredUser, error: null });
          }
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
          const refreshToken = response.data?.data?.refreshToken;

          if (accessToken) {
            setTokens(accessToken, refreshToken);
          }
          if (user) {
            const filteredUser = filterUserData(user);
            setUser(filteredUser);
            set({ user: filteredUser });
          }

          set({ loading: false, error: null, isInitialized: true });
          return { success: true, user: filteredUser };
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

          if (response.data?.success !== true) {
            const errorMsg = response.data?.message || "Login failed";
            set({ loading: false, error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const user = response.data?.data?.user;
          const accessToken = response.data?.data?.accessToken;
          const refreshToken = response.data?.data?.refreshToken;

          if (!accessToken || !user) {
            set({ loading: false, error: "Invalid server response" });
            return { success: false, error: "Invalid server response" };
          }

          // Save tokens
          setTokens(accessToken, refreshToken);

          const filteredUser = filterUserData(user);
          setUser(filteredUser);

          set({
            user: filteredUser,
            loading: false,
            error: null,
            isInitialized: true
          });

          // 🔥 Set cookie for middleware (重要!)
          if (typeof window !== 'undefined') {
            // Set cookie for middleware (expires in 15 min)
            document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
            document.cookie = `userRole=${filteredUser.role}; path=/; max-age=604800; SameSite=Lax`;
          }

          // 🔥 Manual redirect after state update
          setTimeout(() => {
            if (filteredUser.role === "admin") {
              window.location.href = "/dashboard/admin";
            } else {
              window.location.href = "/dashboard/user";
            }
          }, 100);

          return { success: true, user: filteredUser };

        } catch (error) {
          console.error("Login error:", error);
          const message = error.response?.data?.message || "Login failed. Please try again.";
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
          clearTokens();

          if (typeof window !== 'undefined') {
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }

          set({ user: null, isInitialized: true, error: null, loading: false });

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      checkAndRefreshToken: async () => {
        const token = getAccessToken();
        if (!token) return false;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          if (isExpired) {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              clearTokens();
              return false;
            }

            const response = await api.post("/auth/refresh-token");
            if (response.data?.data?.accessToken) {
              setTokens(response.data.data.accessToken, response.data.data.refreshToken);
              return true;
            }
            return false;
          }
          return true;
        } catch {
          return false;
        }
      },


      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        }
      },

      setUser: (user) => {
        if (typeof window !== 'undefined' && user) {
          localStorage.setItem('user', JSON.stringify(user));
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
        if (get().user) {
          const filteredUser = filterUserData(get().user);
          setUser(filteredUser);
        }
      },

      updateUserPartial: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
        if (get().user) {
          const filteredUser = filterUserData(get().user);
          setUser(filteredUser);
        }
      },

      isAuthenticated: () => {
        const token = getAccessToken();
        if (!token || !get().user) return false;

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },

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
          setItem: () => { },
          removeItem: () => { },
        };
      },
      partialize: (state) => ({
        user: state.user ? filterUserData(state.user) : null,
        isInitialized: state.isInitialized
      }),
    }
  )
);