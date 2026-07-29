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

        // Queue concurrent refresh requests
        const refreshState = getRefreshState();
        if (refreshState.isRefreshing) {
            return new Promise((resolve, reject) => {
                const queue = getRefreshQueue();
                queue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        originalRequest._retry = true;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
                setRefreshQueue(queue);
            });
        }

        originalRequest._retry = true;
        setRefreshState({ isRefreshing: true, queue: getRefreshQueue() });

        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token");
            }

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
                throw new Error("No new access token");
            }

            // Single token write
            setTokens(newAccessToken, newRefreshToken);

            // Process queued requests
            const queue = getRefreshQueue();
            queue.forEach((prom) => prom.resolve(newAccessToken));
            setRefreshQueue([]);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            // Process queue with error
            const queue = getRefreshQueue();
            queue.forEach((prom) => prom.reject(refreshError));
            setRefreshQueue([]);

            const hasRefreshToken = getRefreshToken();
            if (hasRefreshToken) {
                forceLogout();
            }
            return Promise.reject(refreshError);
        } finally {
            setRefreshState({ isRefreshing: false, queue: [] });
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

            // Only attempt refresh when token is close to expiry (under 5 minutes)
            if (expiresIn < 300000 && expiresIn > 60000) {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    return; // leave the timer running — let the response interceptor handle it
                }

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
                if (newAccessToken) {
                    setTokens(newAccessToken, refreshToken);
                }
            } else if (expiresIn <= 60000) {
                // Token is critically close to expiry — rely on response interceptor instead
                // The interceptor handles 401s with queued refresh + retry
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    // No refresh token at all — schedule a graceful logout
                    if (expiresIn < 10000) {
                        refreshTimerActive = false;
                        clearInterval(refreshInterval);
                        refreshInterval = null;
                        // Don't forceLogout — let the next API call's 401 interceptor handle it
                    }
                    return;
                }
            }
        } catch (error) {
            // Silent — the response interceptor handles real failures
            // Only force logout if we're sure the session is gone
            if (error.message?.includes('jwt expired') || error.message?.includes('malformed')) {
                // Token decoding failed — let the response interceptor handle actual API calls
                return;
            }
        }
    }, 60000); // Check every 60 seconds instead of 30
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