import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000/api/v1";
    }
    return process.env.NEXT_PUBLIC_API_URL || "https://your-backend.vercel.app/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://your-backend.vercel.app/api/v1";
};

const TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const getCookieValue = (name) => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY) || getCookieValue("accessToken") || null;
  }
  return null;
};

export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookieValue("refreshToken") || null;
  }
  return null;
};

export const setTokens = (accessToken, refreshToken) => {
  if (typeof window !== "undefined") {
    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const setUser = (user) => {
  if (typeof window !== "undefined" && user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

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

const setCookie = (name, value, maxAge) => {
  if (typeof window !== "undefined" && value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
};

const clearCookie = (name) => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const privateApi = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  clearCookie("accessToken");
  clearCookie("refreshToken");
  clearCookie("userRole");

  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage");
    window.location.replace("/login?session=expired");
  }
};

const refreshAccessTokenAPI = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await privateApi.post(
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
    throw new Error("No new access token returned");
  }

  setTokens(newAccessToken, newRefreshToken);
  setCookie("accessToken", newAccessToken, 120);
  setCookie("refreshToken", newRefreshToken, 604800);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const startTokenRefreshTimer = () => {
  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(async () => {
    const token = getAccessToken();
    if (!token || isRefreshing) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = payload.exp * 1000 - Date.now();

      if (expiresIn < 60000) {
        await refreshAccessTokenAPI();
      }
    } catch (error) {
      console.error("Token refresh timer error:", error);
    }
  }, 30000);
};

export const stopTokenRefreshTimer = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

api.interceptors.response.use(
  (response) => {
    if (response.data?.data?.accessToken) {
      setTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
      setCookie("accessToken", response.data.data.accessToken, 120);

      if (response.data.data.refreshToken) {
        setCookie("refreshToken", response.data.data.refreshToken, 604800);
      }

      if (response.data?.data?.user?.role) {
        setCookie("userRole", response.data.data.user.role, 604800);
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

    if (isAuthCall) {
      return Promise.reject(error);
    }

    if (isRefreshCall) {
      forceLogout();
      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      forceLogout();
      return Promise.reject(error);
    }

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
      const { accessToken } = await refreshAccessTokenAPI();
      processQueue(null, accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;