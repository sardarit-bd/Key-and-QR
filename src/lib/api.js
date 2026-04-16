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
  }
};

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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

export const isTokenValid = () => {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Request interceptor - Add access token to headers
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

// 🔥 Response interceptor - Handle token refresh
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

api.interceptors.response.use(
  (response) => {
    // Save tokens from response if present
    if (response.data?.data?.accessToken) {
      setTokens(
        response.data.data.accessToken,
        response.data.data.refreshToken
      );
    }
    if (response.data?.data?.user) {
      setUser(response.data.data.user);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (!error.response) {
      return Promise.reject(error);
    }
    
    // Don't retry for login/register
    const isAuthCall = originalRequest?.url?.includes("/auth/login") ||
                      originalRequest?.url?.includes("/auth/register");
    
    if (isAuthCall) {
      return Promise.reject(error);
    }
    
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");
    
    // If refresh token call fails, clear everything and redirect
    if (isRefreshCall) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = "/login?session=expired";
      }
      return Promise.reject(error);
    }
    
    // 🔥 Handle 401 - Token expired
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
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
        
        // 🔥 Call refresh endpoint with refresh token in header
        const response = await api.post("/auth/refresh-token", {}, {
          headers: {
            'x-refresh-token': refreshToken
          }
        });
        
        const newAccessToken = response.data?.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken;
        
        if (newAccessToken) {
          setTokens(newAccessToken, newRefreshToken);
          onRefreshed(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No token returned");
        }
      } catch (refreshError) {
        clearTokens();
        onRefreshed(null);
        
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

export default api;