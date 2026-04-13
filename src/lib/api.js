import axios from "axios";

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://key-and-qr-backend.vercel.app/api/v1';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track refresh token requests to prevent multiple simultaneous refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - add token from cookie or localStorage
api.interceptors.request.use((config) => {
  // Try to get token from cookie first
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };
  
  let token = getCookie('accessToken');
  
  // If not in cookie, try localStorage
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!error.response) {
      return Promise.reject(error);
    }
    
    const is401 = error.response.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");
    const isLoginCall = originalRequest?.url?.includes("/auth/login");
    const isRegisterCall = originalRequest?.url?.includes("/auth/register");
    const isMeCall = originalRequest?.url?.includes("/auth/me");
    
    // Don't retry login, register, or refresh calls
    if (isLoginCall || isRegisterCall || isRefreshCall) {
      return Promise.reject(error);
    }
    
    // Handle 401 errors
    if (is401 && !originalRequest._retry) {
      // If this is the /me call, don't try to refresh - just reject
      if (isMeCall) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh token
        const response = await api.post("/auth/refresh-token");
        const newAccessToken = response.data?.data?.accessToken;
        
        if (newAccessToken) {
          // Store new token
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newAccessToken);
          }
          
          // Process queued requests
          processQueue(null, newAccessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No access token returned");
        }
      } catch (refreshError) {
        // Refresh failed - clear all auth data
        processQueue(refreshError, null);
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login?session=expired";
          }
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