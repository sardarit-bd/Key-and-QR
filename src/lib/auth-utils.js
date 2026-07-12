const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// ============================================================
// COOKIE UTILITIES
// ============================================================

/**
 * Get cookie value by name
 */
const getCookieValue = (name) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
};

/**
 * Set cookie with name, value, and maxAge
 */
const setCookie = (name, value, maxAge, secure = false) => {
    if (typeof document === "undefined" || !value) return;
    const sameSite = secure ? "None" : "Lax";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
};

/**
 * Clear cookie by name
 */
const clearCookie = (name) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// ============================================================
// TOKEN UTILITIES
// ============================================================

/**
 * Get access token from localStorage or cookies
 */
export const getAccessToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(TOKEN_KEY) || getCookieValue("accessToken") || null;
    }
    return null;
};

/**
 * Get refresh token from localStorage or cookies
 */
export const getRefreshToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookieValue("refreshToken") || null;
    }
    return null;
};

/**
 * Set tokens in localStorage and cookies
 */
export const setTokens = (accessToken, refreshToken) => {
    if (typeof window === "undefined") return;
    if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        setCookie("accessToken", accessToken, 900, false); // 15 min
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        setCookie("refreshToken", refreshToken, 604800, false); // 7 days
    }
};

/**
 * Clear all tokens from localStorage and cookies
 */
export const clearTokens = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookie("accessToken");
    clearCookie("refreshToken");
    clearCookie("userRole");
};

/**
 * Set user in localStorage
 */
export const setUser = (user) => {
    if (typeof window !== "undefined" && user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

/**
 * Get user from localStorage
 */
export const getUser = () => {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
    }
    return null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
};

// ============================================================
// COOKIE UTILITY EXPORTS (for internal use)
// ============================================================

export { setCookie, clearCookie, getCookieValue };