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
        if (typeof window !== "undefined") {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                if (tz) {
                    config.headers["x-timezone"] = tz;
                }
                config.headers["x-timezone-offset"] = new Date().getTimezoneOffset().toString();
            } catch {
                // Ignore if Intl or Date fails
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================================
// REFRESH CLIENT (Isolated instance without interceptors)
// ============================================================

const refreshClient = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================================
// TOKEN REFRESH COORDINATION (In-flight Mutex & Queue)
// ============================================================

let activeRefreshPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform a synchronized token refresh.
 * Guarantees only ONE refresh request in flight at any time.
 */
export const performTokenRefresh = async () => {
    // 1. Return in-flight promise if a refresh is already occurring
    if (activeRefreshPromise) {
        return activeRefreshPromise;
    }

    // 2. Cross-tab coordination check
    if (typeof window !== "undefined") {
        const refreshInProgressTime = localStorage.getItem("auth_refresh_in_progress");
        if (refreshInProgressTime && Date.now() - parseInt(refreshInProgressTime, 10) < 10000) {
            activeRefreshPromise = (async () => {
                const startTime = Date.now();
                while (Date.now() - startTime < 10000) {
                    await sleep(200);
                    const stillInProgress = localStorage.getItem("auth_refresh_in_progress");
                    if (!stillInProgress) {
                        const token = getAccessToken();
                        if (token && !isTokenExpired(token)) {
                            return token;
                        }
                        break;
                    }
                }
                return executeRefresh();
            })();

            try {
                return await activeRefreshPromise;
            } finally {
                activeRefreshPromise = null;
            }
        }
    }

    activeRefreshPromise = executeRefresh();
    try {
        return await activeRefreshPromise;
    } finally {
        activeRefreshPromise = null;
    }
};

const executeRefresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    if (typeof window !== "undefined") {
        localStorage.setItem("auth_refresh_in_progress", Date.now().toString());
    }
    setRefreshState({ isRefreshing: true });

    try {
        // Call refresh endpoint using clean isolated client
        const response = await refreshClient.post(
            "/auth/refresh-token",
            {},
            {
                headers: {
                    "x-refresh-token": refreshToken,
                },
            }
        );

        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken || refreshToken;

        if (!newAccessToken) {
            throw new Error("No new access token returned from server");
        }

        // Synchronously save new tokens
        setTokens(newAccessToken, newRefreshToken);

        // Broadcast new tokens to all sibling tabs so they stop using the old (now-revoked) refresh token
        broadcastTokenSync(newAccessToken, newRefreshToken);

        return newAccessToken;
    } finally {
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth_refresh_in_progress");
        }
        setRefreshState({ isRefreshing: false });
    }
};

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
            forceLogout();
            return Promise.reject(error);
        }

        // Non-401 errors: pass through
        if (status !== 401) {
            return Promise.reject(error);
        }

        // Already retried once and still failed: force logout
        if (originalRequest._retry) {
            forceLogout();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const newAccessToken = await performTokenRefresh();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            forceLogout();
            return Promise.reject(refreshError);
        }
    }
);

// ============================================================
// FORCE LOGOUT
// ============================================================

let isLoggingOut = false;

export const forceLogout = () => {
    // Mutex: prevent multiple concurrent 401 interceptors from triggering duplicate redirects
    if (isLoggingOut) return;
    isLoggingOut = true;

    stopTokenRefreshTimer();

    // Revoke refresh token on server (fire-and-forget, best-effort)
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        refreshClient.post(
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

    // Do NOT reset isLoggingOut — once we're navigating away,
    // the lock must hold for the rest of the page lifecycle
    // to prevent AbortError from concurrent redirect attempts.
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

// ============================================================
// CROSS-TAB TOKEN SYNC — BroadcastChannel + storage fallback
// ============================================================

const AUTH_SYNC_CHANNEL = "auth_token_sync";

/**
 * Broadcast fresh tokens to all sibling tabs after a successful rotation.
 * Uses BroadcastChannel where available, falls back to a localStorage pulse.
 */
const broadcastTokenSync = (accessToken, refreshToken) => {
    if (typeof window === "undefined") return;
    const payload = JSON.stringify({ accessToken, refreshToken, ts: Date.now() });

    try {
        const bc = new BroadcastChannel(AUTH_SYNC_CHANNEL);
        bc.postMessage(payload);
        bc.close();
    } catch {
        // BroadcastChannel not available (e.g. some privacy modes) — use storage event as fallback
        try {
            localStorage.setItem("auth_token_broadcast", payload);
            // Remove immediately so next rotation can fire a fresh event
            setTimeout(() => localStorage.removeItem("auth_token_broadcast"), 200);
        } catch { /* silent */ }
    }
};

/**
 * Handle a token sync message from another tab.
 * Applies the new tokens only if they are actually newer than what we have.
 */
const handleCrossTabTokenSync = (data) => {
    try {
        const { accessToken, refreshToken, ts } = typeof data === "string" ? JSON.parse(data) : data;
        if (!accessToken || !refreshToken) return;

        const currentToken = getAccessToken();
        if (currentToken === accessToken) return; // Already up-to-date

        // Verify the broadcast token is newer — compare exp timestamps
        try {
            const currentExp = currentToken ? JSON.parse(atob(currentToken.split(".")[1])).exp : 0;
            const newExp = JSON.parse(atob(accessToken.split(".")[1])).exp;
            if (newExp <= currentExp) return; // Don't downgrade tokens
        } catch { /* accept if we can't compare */ }

        setTokens(accessToken, refreshToken);
        // Reset the in-tab active refresh promise so the next request uses the fresh token
        activeRefreshPromise = null;
    } catch { /* silent */ }
};

// ============================================================
// VISIBILITY CHANGE — Eager Refresh on Tab Focus
// ============================================================

let _visibilityRefreshScheduled = false;

const handleVisibilityChange = async () => {
    if (typeof document === "undefined" || document.visibilityState !== "visible") return;
    if (_visibilityRefreshScheduled) return;

    const token = getAccessToken();
    const refresh = getRefreshToken();

    // Only attempt if we have a refresh token and the access token is expired or near-expired
    if (!refresh) return;
    if (token && !isTokenExpired(token)) return;

    _visibilityRefreshScheduled = true;
    try {
        await performTokenRefresh();
    } catch {
        // forceLogout will be called by executeRefresh if the refresh token is invalid
    } finally {
        _visibilityRefreshScheduled = false;
    }
};

if (typeof window !== "undefined") {
    // --- Lifecycle timers ---
    window.addEventListener('beforeunload', () => {
        stopTokenRefreshTimer();
    });

    window.addEventListener('auth:force-logout', () => {
        stopTokenRefreshTimer();
    });

    // --- Eager refresh on tab reactivation ---
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- Cross-tab token sync via BroadcastChannel ---
    try {
        const bc = new BroadcastChannel(AUTH_SYNC_CHANNEL);
        bc.addEventListener('message', (e) => handleCrossTabTokenSync(e.data));
        // Do NOT close bc — it must remain open to receive messages
    } catch {
        // BroadcastChannel unavailable — fall back to storage events
        window.addEventListener('storage', (e) => {
            if (e.key === "auth_token_broadcast" && e.newValue) {
                handleCrossTabTokenSync(e.newValue);
            }
        });
    }
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