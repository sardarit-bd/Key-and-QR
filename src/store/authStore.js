"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, {
  setTokens,
  clearTokens,
  getUser,
  getAccessToken,
  getRefreshToken,
  startTokenRefreshTimer,
  stopTokenRefreshTimer
} from "@/lib/api";

const filterUserData = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage?.url || user.profileImage || null,
    provider: user.provider,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    isEmailVerified: user.isEmailVerified || false,
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Direct setter for user (for Google callback)
      setUser: (userData) => {
        console.log("setUser called with:", userData);
        const filteredUser = filterUserData(userData);
        set({ user: filteredUser });
        if (typeof window !== "undefined" && filteredUser) {
          localStorage.setItem("user", JSON.stringify(filteredUser));
        }
      },

      // Direct setter for isInitialized
      setIsInitialized: (status) => {
        console.log("setIsInitialized called with:", status);
        set({ isInitialized: status });
      },

      // Set loading state
      setLoading: (loadingStatus) => {
        set({ loading: loadingStatus, isLoading: loadingStatus });
      },

      // Initialize auth
      initializeAuth: async () => {
        const state = get();

        if (state.isInitialized) {
          console.log("Already initialized, user:", state.user);
          return;
        }

        if (state.loading || state.isLoading) {
          console.log("Already loading auth");
          return;
        }

        console.log("🟢 Initializing auth...");
        set({ loading: true, isLoading: true });

        try {
          const storedUser = getUser();
          const storedToken = getAccessToken();
          const storedRefreshToken = getRefreshToken();

          // No token at all
          if (!storedToken && !storedRefreshToken) {
            set({
              user: null,
              isInitialized: true,
              loading: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          if (storedUser && (storedToken || storedRefreshToken)) {
            console.log("🟢 Using stored user from localStorage");
            const filteredUser = filterUserData(storedUser);

            if (typeof window !== "undefined") {
              if (storedToken && !document.cookie.includes("accessToken")) {
                document.cookie = `accessToken=${storedToken}; path=/; max-age=120; SameSite=Lax`;
              }

              if (storedRefreshToken && !document.cookie.includes("refreshToken")) {
                document.cookie = `refreshToken=${storedRefreshToken}; path=/; max-age=604800; SameSite=Lax`;
              }

              if (!document.cookie.includes("userRole") && filteredUser?.role) {
                document.cookie = `userRole=${filteredUser.role}; path=/; max-age=604800; SameSite=Lax`;
              }

              // Start token refresh timer
              startTokenRefreshTimer();
            }

            set({
              user: filteredUser,
              isInitialized: true,
              loading: false,
              isLoading: false,
              error: null,
            });

            // Background verification
            api
              .get("/auth/me")
              .then((response) => {
                const freshUser = response.data?.data;
                if (freshUser) {
                  const filteredFreshUser = filterUserData(freshUser);
                  set({ user: filteredFreshUser });
                  if (typeof window !== "undefined") {
                    localStorage.setItem("user", JSON.stringify(filteredFreshUser));
                  }
                }
              })
              .catch(() => {
                console.log("Background verification failed, but user stays logged in");
              });

            return;
          }

          if ((storedToken || storedRefreshToken) && !storedUser) {
            console.log("Token exists, fetching user from server");
            const response = await api.get("/auth/me");
            const user = response.data?.data;

            if (user) {
              const filteredUser = filterUserData(user);
              set({ user: filteredUser });

              if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(filteredUser));

                if (storedToken && !document.cookie.includes("accessToken")) {
                  document.cookie = `accessToken=${storedToken}; path=/; max-age=120; SameSite=Lax`;
                }

                if (storedRefreshToken && !document.cookie.includes("refreshToken")) {
                  document.cookie = `refreshToken=${storedRefreshToken}; path=/; max-age=604800; SameSite=Lax`;
                }

                if (!document.cookie.includes("userRole") && filteredUser?.role) {
                  document.cookie = `userRole=${filteredUser.role}; path=/; max-age=604800; SameSite=Lax`;
                }
              }

              // Start token refresh timer
              startTokenRefreshTimer();
            }
          }

          set({
            isInitialized: true,
            loading: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Init auth error:", error);
          set({
            user: null,
            isInitialized: true,
            loading: false,
            isLoading: false,
            error: error.message,
          });
        }
      },

      // Fetch me
      fetchMe: async () => {
        try {
          const response = await api.get("/auth/me");
          const user = response.data?.data ?? null;

          if (user) {
            const filteredUser = filterUserData(user);
            set({ user: filteredUser, error: null });

            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(filteredUser));
            }
          }

          return user;
        } catch (error) {
          console.error("Fetch me error:", error);
          set({ user: null, error: null });
          return null;
        }
      },

      // Register
      register: async (payload) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const response = await api.post("/auth/register", payload);
          const user = response.data?.data?.user ?? null;
          const accessToken = response.data?.data?.accessToken;
          const refreshToken = response.data?.data?.refreshToken;

          if (accessToken) {
            setTokens(accessToken, refreshToken);
          }

          let filteredUser = null;
          if (user) {
            filteredUser = filterUserData(user);
            set({ user: filteredUser });

            if (typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(filteredUser));
            }
          }

          if (typeof window !== "undefined") {
            if (accessToken) {
              document.cookie = `accessToken=${accessToken}; path=/; max-age=120; SameSite=Lax`;
            }
            if (refreshToken) {
              document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
            }
            if (filteredUser?.role) {
              document.cookie = `userRole=${filteredUser.role}; path=/; max-age=604800; SameSite=Lax`;
            }

            startTokenRefreshTimer();
          }

          set({
            loading: false,
            isLoading: false,
            error: null,
            isInitialized: true,
          });

          return { success: true, user: filteredUser };
        } catch (error) {
          const message = error.response?.data?.message || "Registration failed";
          set({ loading: false, isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Login
      login: async (payload) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", payload);

          if (response.data?.success !== true) {
            const errorMsg = response.data?.message || "Login failed";
            set({ loading: false, isLoading: false, error: errorMsg });
            return { success: false, error: errorMsg };
          }

          const user = response.data?.data?.user;
          const accessToken = response.data?.data?.accessToken;
          const refreshToken = response.data?.data?.refreshToken;

          if (!accessToken || !user) {
            set({
              loading: false,
              isLoading: false,
              error: "Invalid server response",
            });
            return { success: false, error: "Invalid server response" };
          }

          // Save tokens
          setTokens(accessToken, refreshToken);

          const filteredUser = filterUserData(user);
          set({ user: filteredUser });

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(filteredUser));

            if (accessToken) {
              document.cookie = `accessToken=${accessToken}; path=/; max-age=120; SameSite=Lax`;
            }
            if (refreshToken) {
              document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
            }
            if (filteredUser?.role) {
              document.cookie = `userRole=${filteredUser.role}; path=/; max-age=604800; SameSite=Lax`;
            }

            startTokenRefreshTimer();
          }

          set({
            loading: false,
            isLoading: false,
            error: null,
            isInitialized: true,
          });

          // Redirect after state update
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
          const message =
            error.response?.data?.message || "Login failed. Please try again.";
          set({ loading: false, isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        set({ loading: true, isLoading: true });

        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          clearTokens();

          // Stop token refresh timer
          stopTokenRefreshTimer();

          if (typeof window !== "undefined") {
            document.cookie =
              "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie =
              "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie =
              "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            localStorage.removeItem("user");
          }

          set({
            user: null,
            isInitialized: true,
            error: null,
            loading: false,
            isLoading: false,
          });

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      },

      // Check and refresh token
      checkAndRefreshToken: async () => {
        const token = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!token && !refreshToken) {
          return false;
        }

        return true;
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const response = await api.post("/auth/forgot-password", { email });
          set({ loading: false, isLoading: false });
          return {
            success: true,
            message: response.data?.message || "Reset email sent",
          };
        } catch (error) {
          const message =
            error.response?.data?.message || "Failed to send reset email";
          set({ loading: false, isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Reset password
      resetPassword: async (token, newPassword) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const response = await api.post("/auth/reset-password", {
            token,
            newPassword,
          });
          set({ loading: false, isLoading: false });
          return {
            success: true,
            message: response.data?.message || "Password reset successfully",
          };
        } catch (error) {
          const message =
            error.response?.data?.message || "Password reset failed";
          set({ loading: false, isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Change password
      changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, isLoading: true, error: null });

        try {
          const response = await api.post("/auth/change-password", {
            oldPassword,
            newPassword,
          });
          set({ loading: false, isLoading: false });
          return {
            success: true,
            message: response.data?.message || "Password changed successfully",
          };
        } catch (error) {
          const message =
            error.response?.data?.message || "Password change failed";
          set({ loading: false, isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Update user
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : null,
        }));
        const currentUser = get().user;
        if (currentUser) {
          const filteredUser = filterUserData(currentUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(filteredUser));
          }
        }
      },

      // Update user partial
      updateUserPartial: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
        const currentUser = get().user;
        if (currentUser) {
          const filteredUser = filterUserData(currentUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(filteredUser));
          }
        }
      },

      // Check if authenticated
      isAuthenticated: () => {
        const token = getAccessToken();
        const user = get().user;
        if (!token || !user) return false;

        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.exp * 1000 > Date.now();
        } catch {
          return false;
        }
      },

      // Check if admin
      isAdmin: () => get().user?.role === "admin",

      // Get user
      getUser: () => get().user,
    }),
    {
      name: "auth-storage",
      getStorage: () => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      },
      partialize: (state) => ({
        user: state.user ? filterUserData(state.user) : null,
        isInitialized: state.isInitialized,
      }),
    }
  )
);