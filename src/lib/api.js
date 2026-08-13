import axios from "axios";
import {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getUser,
    setUser,
    isTokenExpired,
    getRefreshState,
    setRefreshState,
    getRefreshQueue,
    setRefreshQueue,
} from "./auth-utils";

// ============================================================
// BASE URL CONFIGURATION
// ============================================================

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
        }
        return process.env.NEXT_PUBLIC_API_URL || "https://your-backend.vercel.app/api/v1";
    }
    return process.env.NEXT_PUBLIC_API_URL || "https://your-backend.vercel.app/api/v1";
};

// ============================================================
// MAIN API INSTANCE
// ============================================================

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR - Centralized Token Handling
// ============================================================

// Unified refresh promise to prevent concurrent duplicate calls within the same tab
let activeRefreshPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform a synchronized token refresh.
 * Leverages in-memory active promise for same-tab coordination, and
 * localStorage flag ('auth_refresh_in_progress') for cross-tab coordination.
 */
const performTokenRefresh = async () => {
    // 1. Return in-flight promise if current tab is already refreshing
    if (activeRefreshPromise) {
        return activeRefreshPromise;
    }

    // 2. Cross-tab synchronization using localStorage
    if (typeof window !== "undefined") {
        const refreshInProgressTime = localStorage.getItem("auth_refresh_in_progress");
        if (refreshInProgressTime && Date.now() - parseInt(refreshInProgressTime, 10) < 10000) {
            activeRefreshPromise = (async () => {
                const startTime = Date.now();
                while (Date.now() - startTime < 10000) {
                    await sleep(200);
                    const stillInProgress = localStorage.getItem("auth_refresh_in_progress");
                    if (!stillInProgress) {
                        const newAccessToken = getAccessToken();
                        if (newAccessToken && !isTokenExpired(newAccessToken)) {
                            return newAccessToken;
                        }
                        break;
                    }
                }
                return doRefreshCall();
            })();
            return activeRefreshPromise;
        }
    }

    return doRefreshCall();
};

const doRefreshCall = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    if (typeof window !== "undefined") {
        localStorage.setItem("auth_refresh_in_progress", Date.now().toString());
    }
    setRefreshState({ isRefreshing: true });

    activeRefreshPromise = (async () => {
        try {
            const response = await api.post(
                "/auth/refresh-token",
                {},
                {
                    headers: {
                        "x-refresh-token": refreshToken,
                    },
                }
            );

            const newAccessToken = response.data?.data?.accessToken;
            const newRefreshToken = response.data?.data?.refreshToken ?? refreshToken;

            if (!newAccessToken) {
                throw new Error("No new access token returned from server");
            }

            // Single token write (automatically syncs storage and cookies)
            setTokens(newAccessToken, newRefreshToken);
            return newAccessToken;
        } finally {
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_refresh_in_progress");
            }
            setRefreshState({ isRefreshing: false });
            activeRefreshPromise = null;
        }
    })();

    return activeRefreshPromise;
};

api.interceptors.response.use(
    (response) => {
        // Centralized token update from responses
        if (response.data?.data?.accessToken) {
            setTokens(
                response.data.data.accessToken,
                response.data.data.refreshToken || getRefreshToken()
            );
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (!error.response || !originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response.status;
        const isRefreshCall = originalRequest.url?.includes("/auth/refresh-token");
        const isAuthCall =
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/register") ||
            originalRequest.url?.includes("/auth/forgot-password") ||
            originalRequest.url?.includes("/auth/reset-password");

        // Auth calls: don't retry
        if (isAuthCall) {
            return Promise.reject(error);
        }

        // Refresh call failed
        if (isRefreshCall) {
            const hasRefreshToken = getRefreshToken();
            if (hasRefreshToken) {
                forceLogout();
            }
            return Promise.reject(error);
        }

        // Non-401 errors: pass through
        if (status !== 401) {
            return Promise.reject(error);
        }

        // Already retried: force logout
        if (originalRequest._retry) {
            const hasRefreshToken = getRefreshToken();
            if (hasRefreshToken) {
                forceLogout();
            }
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const newAccessToken = await performTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            const hasRefreshToken = getRefreshToken();
            if (hasRefreshToken) {
                forceLogout();
            }
            return Promise.reject(refreshError);
        }
    }
);

// ============================================================
// FORCE LOGOUT
// ============================================================

let isLoggingOut = false;

const forceLogout = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    stopTokenRefreshTimer();

    // Revoke refresh token on server (fire-and-forget, best-effort)
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        api.post(
            "/auth/logout",
            {},
            {
                headers: { "x-refresh-token": refreshToken },
                timeout: 5000,
            }
        ).catch(() => {});
    }

    clearTokens();

    if (typeof window !== "undefined") {
        // Dispatch event for store reset
        window.dispatchEvent(new CustomEvent('auth:force-logout'));

        window.location.replace("/login?session=expired");
    }

    setTimeout(() => {
        isLoggingOut = false;
    }, 1000);
};

// ============================================================
// TOKEN REFRESH TIMER
// ============================================================

let refreshInterval = null;
let refreshTimerActive = false;

export const startTokenRefreshTimer = () => {
    if (refreshTimerActive && refreshInterval) {
        return;
    }

    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }

    refreshTimerActive = true;

    refreshInterval = setInterval(async () => {
        if (!refreshTimerActive) {
            clearInterval(refreshInterval);
            refreshInterval = null;
            return;
        }

        const token = getAccessToken();
        const refreshState = getRefreshState();

        if (!token || refreshState.isRefreshing) {
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiresIn = payload.exp * 1000 - Date.now();

            // Attempt refresh when token is close to expiry (under 5 minutes)
            if (expiresIn < 300000) {
                const refreshToken = getRefreshToken();
                if (refreshToken) {
                    await performTokenRefresh();
                }
            }
        } catch (error) {
            // Silent — the response interceptor handles real failures
            if (error.message?.includes('jwt expired') || error.message?.includes('malformed')) {
                return;
            }
        }
    }, 60000); // Check every 60 seconds
};

export const stopTokenRefreshTimer = () => {
    refreshTimerActive = false;
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

if (typeof window !== "undefined") {
    window.addEventListener('beforeunload', () => {
        stopTokenRefreshTimer();
    });

    window.addEventListener('auth:force-logout', () => {
        stopTokenRefreshTimer();
    });
}

// ============================================================
// EXPORTS (Backward Compatibility)
// ============================================================

export {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getUser,
    setUser,
    isTokenExpired,
    startTokenRefreshTimer,
    stopTokenRefreshTimer,
};

export default api;