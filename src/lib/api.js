import axios from "axios";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
    
    // Production - Vercel
    return process.env.NEXT_PUBLIC_API_URL || 'https://key-and-qr-backend.vercel.app/api/v1';
  }
  
  // Server side
  return process.env.NEXT_PUBLIC_API_URL || 'https://key-and-qr-backend.vercel.app/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (more reliable than cookie for production)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
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
    const isLogoutCall = originalRequest?.url?.includes("/auth/logout");
    
    // Don't retry these calls
    if (isRefreshCall || isLoginCall || isRegisterCall || isLogoutCall) {
      // For refresh token failure, clear storage
      if (isRefreshCall && typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
      return Promise.reject(error);
    }
    
    // Handle 401 errors
    if (is401 && !originalRequest._retry) {
      if (isRefreshing) {
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
        const response = await api.post("/auth/refresh-token");
        const newAccessToken = response.data?.data?.accessToken;
        
        if (newAccessToken) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', newAccessToken);
          }
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No access token returned");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // Only redirect if not on public pages
          const publicPages = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback'];
          const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
          if (!isPublicPage) {
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