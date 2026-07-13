"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "@/services/auth.service";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    getUser,
    isTokenExpired,
    setTokens,
    setUser as setUserStorage,
    updateUser as updateUserStorage,
} from "@/lib/auth-utils";
import { startTokenRefreshTimer, stopTokenRefreshTimer } from "@/lib/api";

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

// ============================================================
// INTERNAL FUNCTIONS (No class methods, no `this`)
// ============================================================

/**
 * ✅ Internal function for background verification
 * Called from initializeAuth
 */
const verifySessionInBackground = async (set, get) => {
    try {
        const response = await authService.getCurrentUser();
        const freshUser = response?.data;
        if (freshUser) {
            const filteredFreshUser = filterUserData(freshUser);
            set({ user: filteredFreshUser });
            setUserStorage(filteredFreshUser);
        }
    } catch (error) {
        // Silent fail - user stays logged in
        console.debug("Background verification failed, user stays logged in");
    }
};

/**
 * ✅ Internal function for fetching user during restore
 */
const fetchUserAndRestore = async (set) => {
    try {
        const response = await authService.getCurrentUser();
        const user = response?.data;
        if (user) {
            const filteredUser = filterUserData(user);
            set({ user: filteredUser });
            setUserStorage(filteredUser);
            return filteredUser;
        }
    } catch (error) {
        console.warn("Failed to fetch user during init:", error.message);
        clearTokens();
        set({ user: null });
    }
    return null;
};

/**
 * ✅ Internal function for guest claim
 */
const claimGuestResourcesIfAvailable = async (set) => {
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
            _isInitializing: false,

            // ============================================================
            // DIRECT SETTERS
            // ============================================================
            
            setUser: (userData) => {
                const filteredUser = filterUserData(userData);
                set({ user: filteredUser });
                if (filteredUser) {
                    setUserStorage(filteredUser);
                }
            },

            setIsInitialized: (status) => {
                set({ isInitialized: status });
            },

            setLoading: (loadingStatus) => {
                set({ loading: loadingStatus, isLoading: loadingStatus });
            },

            // ============================================================
            // INITIALIZATION - Single execution path
            // ============================================================
            
            initializeAuth: async () => {
                const state = get();

                // ✅ Prevent duplicate initialization
                if (state.isInitialized) {
                    return;
                }
                if (state._isInitializing) {
                    return;
                }
                if (state.loading || state.isLoading) {
                    return;
                }

                set({ _isInitializing: true, loading: true, isLoading: true });

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
                            _isInitializing: false,
                        });
                        return;
                    }

                    // ✅ Have stored user + tokens - restore session
                    if (storedUser && (storedToken || storedRefreshToken)) {
                        const filteredUser = filterUserData(storedUser);
                        
                        // Start refresh timer
                        startTokenRefreshTimer();

                        set({
                            user: filteredUser,
                            isInitialized: true,
                            loading: false,
                            isLoading: false,
                            error: null,
                            _isInitializing: false,
                        });

                        // ✅ Background verification (non-blocking) - using internal function
                        verifySessionInBackground(set, get);
                        return;
                    }

                    // ✅ Have token but no user - fetch user
                    if ((storedToken || storedRefreshToken) && !storedUser) {
                        const user = await fetchUserAndRestore(set);
                        if (user) {
                            startTokenRefreshTimer();
                        }
                    }

                    set({
                        isInitialized: true,
                        loading: false,
                        isLoading: false,
                        error: null,
                        _isInitializing: false,
                    });
                } catch (error) {
                    console.error("❌ Auth initialization error:", error);
                    set({
                        user: null,
                        isInitialized: true,
                        loading: false,
                        isLoading: false,
                        error: error.message,
                        _isInitializing: false,
                    });
                }
            },

            // ============================================================
            // GUEST RESOURCE CLAIM
            // ============================================================
            
            claimGuestResourcesIfAvailable: () => {
                // ✅ Using internal function
                return claimGuestResourcesIfAvailable(set);
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

                    // Single token write
                    setTokens(accessToken, refreshToken);

                    const filteredUser = filterUserData(user);
                    setUserStorage(user);
                    set({ user: filteredUser });

                    startTokenRefreshTimer();

                    set({
                        loading: false,
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });

                    const claimResult = await claimGuestResourcesIfAvailable(set);

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

                    // ✅ Single token write
                    setTokens(accessToken, refreshToken);

                    const filteredUser = filterUserData(user);
                    setUserStorage(user);
                    set({ user: filteredUser });

                    startTokenRefreshTimer();

                    set({
                        loading: false,
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });

                    const claimResult = await claimGuestResourcesIfAvailable(set);

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
                    clearTokens();
                    stopTokenRefreshTimer();
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
                        setUserStorage(filteredUser);
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
                    updateUserStorage(currentUser);
                }
            },

            updateUserPartial: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                }));
                const currentUser = get().user;
                if (currentUser) {
                    updateUserStorage(currentUser);
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
                localStorage.removeItem("user");
                set({
                    user: null,
                    loading: false,
                    isLoading: false,
                    isInitialized: false,
                    error: null,
                    isGuestClaimed: false,
                    _isInitializing: false,
                });
            },
        }),
        {
            name: "auth-storage",
            storage: {
                getItem: (name) => {
                    if (typeof window === "undefined") return null;
                    const value = localStorage.getItem(name);
                    if (!value) return null;
                    try {
                        return JSON.parse(value);
                    } catch {
                        return value;
                    }
                },
                setItem: (name, value) => {
                    if (typeof window === "undefined") return;
                    localStorage.setItem(name, JSON.stringify(value));
                },
                removeItem: (name) => {
                    if (typeof window === "undefined") return;
                    localStorage.removeItem(name);
                },
            },
            partialize: (state) => ({
                user: state.user ? filterUserData(state.user) : null,
                isInitialized: state.isInitialized,
                isGuestClaimed: state.isGuestClaimed,
            }),
            onRehydrateStorage: () => {
                console.debug("Auth store rehydrated");
                return (state, error) => {
                    if (error) {
                        console.error("Auth store rehydration error:", error);
                    }
                };
            },
            version: 1,
        }
    )
);