
const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// ============================================================
// INTERNAL STATE - Prevent duplicate writes
// ============================================================

let _isWriting = false;
let _lastWriteTime = 0;
let _writeQueue = [];
let _writeTimeout = null;

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
// INTERNAL WRITE FUNCTIONS
// ============================================================

/**
 * Process queued writes (debounced)
 */
const processWriteQueue = () => {
    if (_writeQueue.length === 0) return;
    
    // Take the last write (most recent)
    const last = _writeQueue[_writeQueue.length - 1];
    _writeQueue = [];
    
    performWrite(last.accessToken, last.refreshToken);
};

/**
 * Perform actual write operation
 */
const performWrite = (accessToken, refreshToken) => {
    if (typeof window === "undefined" || _isWriting) return;
    
    _isWriting = true;
    
    try {
        // Single source of truth: localStorage
        if (accessToken) {
            localStorage.setItem(TOKEN_KEY, accessToken);
        }
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
        
        // Sync cookies (for middleware)
        if (accessToken) {
            setCookie("accessToken", accessToken, 900, false);
        }
        if (refreshToken) {
            setCookie("refreshToken", refreshToken, 604800, false);
        }
    } finally {
        _isWriting = false;
    }
};

// ============================================================
// TOKEN OPERATIONS - Single Write Path
// ============================================================

/**
 * Write tokens - Centralized write operation
 * All token updates go through this function
 */
export const writeTokens = (accessToken, refreshToken) => {
    if (typeof window === "undefined") return;
    
    // Deduplicate rapid writes
    const now = Date.now();
    if (now - _lastWriteTime < 100) {
        // Queue the write instead of executing immediately
        _writeQueue.push({ accessToken, refreshToken });
        // Process queue after debounce
        clearTimeout(_writeTimeout);
        _writeTimeout = setTimeout(processWriteQueue, 150);
        return;
    }
    
    performWrite(accessToken, refreshToken);
    _lastWriteTime = now;
};

/**
 * Read tokens - Single read path
 */
export const readTokens = () => {
    if (typeof window === "undefined") {
        return { accessToken: null, refreshToken: null };
    }
    
    const accessToken = localStorage.getItem(TOKEN_KEY) || getCookieValue("accessToken") || null;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) || getCookieValue("refreshToken") || null;
    
    return { accessToken, refreshToken };
};

/**
 * Get access token
 */
export const getAccessToken = () => {
    return readTokens().accessToken;
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
    return readTokens().refreshToken;
};

/**
 * Set tokens - Public API (maintains backward compatibility)
 */
export const setTokens = (accessToken, refreshToken) => {
    writeTokens(accessToken, refreshToken);
};

/**
 * Clear all tokens
 */
export const clearTokens = () => {
    if (typeof window === "undefined") return;
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookie("accessToken");
    clearCookie("refreshToken");
    
    // Reset write state
    _writeQueue = [];
    _isWriting = false;
    if (_writeTimeout) {
        clearTimeout(_writeTimeout);
        _writeTimeout = null;
    }
};

// ============================================================
// USER OPERATIONS
// ============================================================

/**
 * Set user - Single write path
 */
export const setUser = (user) => {
    if (typeof window !== "undefined" && user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

/**
 * Get user - Single read path
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
 * Update user - Merge with existing
 */
export const updateUser = (updates) => {
    const current = getUser();
    const updated = { ...current, ...updates };
    setUser(updated);
    return updated;
};

// ============================================================
// TOKEN VALIDATION
// ============================================================

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Add 30 second buffer to avoid edge cases
        return payload.exp * 1000 <= Date.now() + 30000;
    } catch {
        return true;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    const token = getAccessToken();
    if (!token) return false;
    return !isTokenExpired(token);
};

// ============================================================
// TOKEN REFRESH STATE
// ============================================================

let _isRefreshing = false;
let _refreshQueue = [];

/**
 * Get current refresh state
 */
export const getRefreshState = () => ({
    isRefreshing: _isRefreshing,
    queueLength: _refreshQueue.length,
});

/**
 * Set refresh state
 */
export const setRefreshState = (state) => {
    _isRefreshing = state.isRefreshing || false;
    if (state.queue !== undefined) {
        _refreshQueue = state.queue;
    }
};

/**
 * Get refresh queue
 */
export const getRefreshQueue = () => _refreshQueue;

/**
 * Set refresh queue
 */
export const setRefreshQueue = (queue) => {
    _refreshQueue = queue || [];
};

// ============================================================
// CLEANUP
// ============================================================

/**
 * Cleanup all internal state
 * Useful for testing or emergency reset
 */
export const cleanupAuthUtils = () => {
    _isWriting = false;
    _lastWriteTime = 0;
    _writeQueue = [];
    if (_writeTimeout) {
        clearTimeout(_writeTimeout);
        _writeTimeout = null;
    }
    _isRefreshing = false;
    _refreshQueue = [];
};

// ============================================================
// EXPORTS (Backward Compatibility)
// ============================================================

export { 
    setCookie, 
    clearCookie, 
    getCookieValue,
    // Internal exports for testing
    processWriteQueue,
    performWrite,
};