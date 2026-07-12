"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "@/services/auth.service";
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getUser,
    setUser as setUserStorage,
    startTokenRefreshTimer,
    stopTokenRefreshTimer,
    isTokenExpired,
} from "@/lib/api";

// ============================================================
// INTERNAL HELPERS
// ============================================================

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
        stripeCustomerId: user.stripeCustomerId || null,
    };
};

const syncCookies = (user, accessToken, refreshToken) => {
    if (typeof window === "undefined") return;
    
    if (accessToken) {
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    }
    if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    }
    if (user?.role) {
        document.cookie = `userRole=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    }
};

const clearCookies = () => {
    if (typeof window === "undefined") return;
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

const saveUserToStorage = (user) => {
    if (typeof window !== "undefined" && user) {
        localStorage.setItem("user", JSON.stringify(user));
    }
};

// ============================================================
// AUTH STORE
// ============================================================

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // ============================================================
            // STATE
            // ============================================================
            
            user: null,
            loading: false,
            isLoading: false,
            isInitialized: false,
            error: null,
            isGuestClaimed: false,

            // ============================================================
            // DIRECT SETTERS (for OAuth callback)
            // ============================================================
            
            setUser: (userData) => {
                const filteredUser = filterUserData(userData);
                set({ user: filteredUser });
                saveUserToStorage(filteredUser);
            },

            setIsInitialized: (status) => {
                set({ isInitialized: status });
            },

            setLoading: (loadingStatus) => {
                set({ loading: loadingStatus, isLoading: loadingStatus });
            },

            // ============================================================
            // INITIALIZATION
            // ============================================================
            
            initializeAuth: async () => {
                const state = get();

                // ✅ Already initialized
                if (state.isInitialized) {
                    console.log("✅ Auth already initialized");
                    return;
                }

                // ✅ Already loading
                if (state.loading || state.isLoading) {
                    console.log("⏳ Auth already loading");
                    return;
                }

                set({ loading: true, isLoading: true });

                try {
                    const storedUser = getUser();
                    const storedToken = getAccessToken();
                    const storedRefreshToken = getRefreshToken();

                    // ✅ No tokens - fresh session
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

                    // ✅ Have stored user + tokens - restore session
                    if (storedUser && (storedToken || storedRefreshToken)) {
                        const filteredUser = filterUserData(storedUser);
                        
                        // Sync cookies
                        syncCookies(filteredUser, storedToken, storedRefreshToken);
                        
                        // Start refresh timer
                        startTokenRefreshTimer();

                        set({
                            user: filteredUser,
                            isInitialized: true,
                            loading: false,
                            isLoading: false,
                            error: null,
                        });

                        // ✅ Background verification (non-blocking)
                        try {
                            const response = await authService.getCurrentUser();
                            const freshUser = response?.data;
                            if (freshUser) {
                                const filteredFreshUser = filterUserData(freshUser);
                                set({ user: filteredFreshUser });
                                saveUserToStorage(filteredFreshUser);
                            }
                        } catch (error) {
                            // Silent fail - user stays logged in
                            console.debug("Background verification failed, user stays logged in");
                        }

                        return;
                    }

                    // ✅ Have token but no user - fetch user
                    if ((storedToken || storedRefreshToken) && !storedUser) {
                        try {
                            const response = await authService.getCurrentUser();
                            const user = response?.data;

                            if (user) {
                                const filteredUser = filterUserData(user);
                                set({ user: filteredUser });
                                saveUserToStorage(filteredUser);
                                syncCookies(filteredUser, storedToken, storedRefreshToken);
                                startTokenRefreshTimer();
                            } else {
                                // No user found - clear invalid session
                                clearTokens();
                                set({ user: null });
                            }
                        } catch (error) {
                            console.warn("Failed to fetch user during init:", error.message);
                            clearTokens();
                            set({ user: null });
                        }
                    }

                    set({
                        isInitialized: true,
                        loading: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    console.error("❌ Auth initialization error:", error);
                    set({
                        user: null,
                        isInitialized: true,
                        loading: false,
                        isLoading: false,
                        error: error.message,
                    });
                }
            },

            // ============================================================
            // GUEST RESOURCE CLAIM
            // ============================================================
            
            claimGuestResourcesIfAvailable: async () => {
                try {
                    const checkResponse = await authService.checkGuestResources();
                    const hasResources = checkResponse?.data?.hasResources || false;

                    if (hasResources) {
                        const claimResponse = await authService.claimGuestResources();
                        const { ordersClaimed, tagsClaimed } = claimResponse?.data || {};

                        set({ isGuestClaimed: true });

                        return {
                            claimed: true,
                            orders: ordersClaimed || 0,
                            tags: tagsClaimed || 0,
                        };
                    }

                    return { claimed: false };
                } catch (error) {
                    console.warn("Guest claim check failed:", error.message);
                    return { claimed: false, error: error.message };
                }
            },

            // ============================================================
            // AUTH METHODS
            // ============================================================
            
            register: async (payload) => {
                set({ loading: true, isLoading: true, error: null });

                try {
                    const response = await authService.register(payload);
                    const { user, accessToken, refreshToken } = response?.data || {};

                    if (!accessToken || !user) {
                        set({ loading: false, isLoading: false, error: "Invalid server response" });
                        return { success: false, error: "Invalid server response" };
                    }

                    // Save tokens
                    setTokens(accessToken, refreshToken);

                    // Save user
                    const filteredUser = filterUserData(user);
                    setUserStorage(user);
                    set({ user: filteredUser });

                    // Sync cookies
                    syncCookies(filteredUser, accessToken, refreshToken);
                    startTokenRefreshTimer();

                    set({
                        loading: false,
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });

                    // Claim guest resources
                    const claimResult = await get().claimGuestResourcesIfAvailable();

                    return {
                        success: true,
                        user: filteredUser,
                        guestClaimed: claimResult?.claimed || false,
                    };
                } catch (error) {
                    const message = error.response?.data?.message || "Registration failed";
                    set({ loading: false, isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            login: async (payload) => {
                set({ loading: true, isLoading: true, error: null });

                try {
                    const response = await authService.login(payload);

                    if (response?.success !== true) {
                        const errorMsg = response?.message || "Login failed";
                        set({ loading: false, isLoading: false, error: errorMsg });
                        return { success: false, error: errorMsg };
                    }

                    const { user, accessToken, refreshToken } = response?.data || {};

                    if (!accessToken || !user) {
                        set({ loading: false, isLoading: false, error: "Invalid server response" });
                        return { success: false, error: "Invalid server response" };
                    }

                    // Save tokens
                    setTokens(accessToken, refreshToken);

                    // Save user
                    const filteredUser = filterUserData(user);
                    setUserStorage(user);
                    set({ user: filteredUser });

                    // Sync cookies
                    syncCookies(filteredUser, accessToken, refreshToken);
                    startTokenRefreshTimer();

                    set({
                        loading: false,
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });

                    // Claim guest resources
                    const claimResult = await get().claimGuestResourcesIfAvailable();

                    return {
                        success: true,
                        user: filteredUser,
                        guestClaimed: claimResult?.claimed || false,
                        guestOrders: claimResult?.orders || 0,
                        guestTags: claimResult?.tags || 0,
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    const message = error.response?.data?.message || "Login failed. Please try again.";
                    set({ loading: false, isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            logout: async () => {
                set({ loading: true, isLoading: true });

                try {
                    await authService.logout();
                } catch (error) {
                    console.warn("Logout API error:", error.message);
                } finally {
                    // Clear all tokens and user data
                    clearTokens();
                    stopTokenRefreshTimer();
                    clearCookies();
                    localStorage.removeItem("user");

                    set({
                        user: null,
                        isInitialized: true,
                        error: null,
                        loading: false,
                        isLoading: false,
                        isGuestClaimed: false,
                    });

                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                }
            },

            // ============================================================
            // PROFILE METHODS
            // ============================================================
            
            fetchMe: async () => {
                try {
                    const response = await authService.getCurrentUser();
                    const user = response?.data ?? null;

                    if (user) {
                        const filteredUser = filterUserData(user);
                        set({ user: filteredUser, error: null });
                        saveUserToStorage(filteredUser);
                    }

                    return user;
                } catch (error) {
                    set({ user: null, error: null });
                    return null;
                }
            },

            updateUser: (updatedUserData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedUserData } : null,
                }));
                const currentUser = get().user;
                if (currentUser) {
                    saveUserToStorage(currentUser);
                }
            },

            updateUserPartial: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }));
                const currentUser = get().user;
                if (currentUser) {
                    saveUserToStorage(currentUser);
                }
            },

            // ============================================================
            // PASSWORD METHODS
            // ============================================================
            
            forgotPassword: async (email) => {
                set({ loading: true, isLoading: true, error: null });

                try {
                    const response = await authService.forgotPassword({ email });
                    set({ loading: false, isLoading: false });
                    return {
                        success: true,
                        message: response?.message || "Reset email sent",
                    };
                } catch (error) {
                    const message = error.response?.data?.message || "Failed to send reset email";
                    set({ loading: false, isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            resetPassword: async (token, newPassword) => {
                set({ loading: true, isLoading: true, error: null });

                try {
                    const response = await authService.resetPassword({ token, newPassword });
                    set({ loading: false, isLoading: false });
                    return {
                        success: true,
                        message: response?.message || "Password reset successfully",
                    };
                } catch (error) {
                    const message = error.response?.data?.message || "Password reset failed";
                    set({ loading: false, isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            changePassword: async (oldPassword, newPassword) => {
                set({ loading: true, isLoading: true, error: null });

                try {
                    const response = await authService.changePassword({ oldPassword, newPassword });
                    set({ loading: false, isLoading: false });
                    return {
                        success: true,
                        message: response?.message || "Password changed successfully",
                    };
                } catch (error) {
                    const message = error.response?.data?.message || "Password change failed";
                    set({ loading: false, isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            // ============================================================
            // HELPERS / GETTERS
            // ============================================================
            
            isAuthenticated: () => {
                const token = getAccessToken();
                const user = get().user;
                if (!token || !user) return false;
                return !isTokenExpired(token);
            },

            isAdmin: () => {
                return get().user?.role === "admin";
            },

            getUser: () => {
                return get().user;
            },

            getToken: () => {
                return getAccessToken();
            },

            checkAndRefreshToken: async () => {
                const token = getAccessToken();
                const refreshToken = getRefreshToken();
                return !!(token || refreshToken);
            },

            reset: () => {
                clearTokens();
                stopTokenRefreshTimer();
                clearCookies();
                localStorage.removeItem("user");
                set({
                    user: null,
                    loading: false,
                    isLoading: false,
                    isInitialized: false,
                    error: null,
                    isGuestClaimed: false,
                });
            },
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
                isGuestClaimed: state.isGuestClaimed,
            }),
        }
    )
);