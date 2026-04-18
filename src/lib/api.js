import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.vercel.app/api/v1';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.vercel.app/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const setTokens = (accessToken, refreshToken) => {
  if (typeof window !== 'undefined') {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // Update cookies for middleware
    if (accessToken) {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=120; SameSite=Lax`;
    }
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
    }
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

export const setUser = (user) => {
  if (typeof window !== 'undefined' && user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
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

// Request interceptor
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

// Refresh token function
let isRefreshing = false;
let pendingRequests = [];

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${getBaseURL()}/auth/refresh-token`,
      {},
      {
        headers: {
          'x-refresh-token': refreshToken
        }
      }
    );

    const newAccessToken = response.data?.data?.accessToken;
    const newRefreshToken = response.data?.data?.refreshToken;

    if (newAccessToken) {
      setTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error("Refresh token failed:", error);
    return null;
  }
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints
    const skipUrls = ["/auth/login", "/auth/register", "/auth/refresh-token"];
    const shouldSkip = skipUrls.some(url => originalRequest?.url?.includes(url));

    if (shouldSkip) {
      return Promise.reject(error);
    }

    // Handle 401 - Token expired
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Retry all queued requests
          pendingRequests.forEach(({ resolve, reject, config }) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            api(config).then(resolve).catch(reject);
          });
          pendingRequests = [];

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No token");
        }
      } catch (refreshError) {
        // Clear all tokens and redirect to login
        clearTokens();
        pendingRequests.forEach(({ reject }) => reject(refreshError));
        pendingRequests = [];

        if (typeof window !== 'undefined') {
          window.location.href = "/login?session=expired";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Background token refresh timer
let refreshTimer = null;

export const startTokenRefreshTimer = () => {
  if (refreshTimer) clearInterval(refreshTimer);

  refreshTimer = setInterval(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();

      // Refresh if token expires in less than 30 seconds
      if (expiresIn < 30000) {
        console.log("Token expiring, refreshing in background...");
        await refreshAccessToken();
      }
    } catch (error) {
      console.error("Timer error:", error);
    }
  }, 10000); // Check every 10 seconds
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

export default api;