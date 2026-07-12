import axios from "axios";
import { 
    getAccessToken, 
    getRefreshToken, 
    setTokens, 
    clearTokens, 
    getUser, 
    setUser,
    isTokenExpired,
} from "./auth-utils";

// ============================================================
// BASE URL CONFIGURATION
// ============================================================

const getBaseURL = () => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return process.env.NEXT_PUBLIC_API_URL;
        }
        return process.env.NEXT_PUBLIC_API_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL;
};

// ============================================================
// COOKIE UTILITIES
// ============================================================

const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
};

const setCookie = (name, value, maxAge, secure = false) => {
    if (typeof document === "undefined" || !value) return;
    const sameSite = secure ? "None" : "Lax";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
};

const clearCookie = (name) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// ============================================================
// TOKEN REFRESH MANAGEMENT
// ============================================================

let isRefreshing = false;
let failedQueue = [];
let refreshInterval = null;
let isLoggingOut = false;

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const forceLogout = () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    clearTokens();
    stopTokenRefreshTimer();
    if (typeof window !== "undefined") {
        window.location.replace("/login?session=expired");
    }
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
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
    (response) => {
        // Handle token updates from responses
        if (response.data?.data?.accessToken) {
            setTokens(
                response.data.data.accessToken,
                response.data.data.refreshToken || getRefreshToken()
            );
            if (response.data?.data?.user?.role) {
                setCookie("userRole", response.data.data.user.role, 604800, false);
            }
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

        // Rate limit for concurrent refresh requests
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        originalRequest._retry = true;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

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

            setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            const hasRefreshToken = getRefreshToken();
            if (hasRefreshToken) {
                forceLogout();
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

// ============================================================
// TOKEN REFRESH TIMER
// ============================================================

export const startTokenRefreshTimer = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    
    refreshInterval = setInterval(async () => {
        const token = getAccessToken();
        if (!token || isRefreshing) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const expiresIn = payload.exp * 1000 - Date.now();

            // Refresh when less than 1 minute remains
            if (expiresIn < 60000) {
                const refreshToken = getRefreshToken();
                if (!refreshToken) return;

                await api.post(
                    "/auth/refresh-token",
                    {},
                    {
                        headers: {
                            "x-refresh-token": refreshToken,
                        },
                    }
                );
            }
        } catch (error) {
            console.error("Token refresh timer error:", error);
        }
    }, 30000); // Check every 30 seconds
};

export const stopTokenRefreshTimer = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};

// ============================================================
// RE-EXPORT AUTH UTILITIES (for convenience)
// ============================================================

export {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
    getUser,
    setUser,
    isTokenExpired,
};

export default api;