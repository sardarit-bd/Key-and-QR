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

api.interceptors.request.use((config) => {
  console.log('🚀 Request:', {
    url: config.url,
    method: config.method,
    baseURL: config.baseURL,
    withCredentials: config.withCredentials,
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    console.log('❌ Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/auth/refresh-token");
    const isLoginCall = originalRequest?.url?.includes("/auth/login");
    const isRegisterCall = originalRequest?.url?.includes("/auth/register");
    const isMeCall = originalRequest?.url?.includes("/auth/me");

    if (isLoginCall || isRegisterCall) {
      return Promise.reject(error);
    }

    if (
      is401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        if (typeof window !== "undefined" && !hasRedirectedToLogin && !isMeCall) {
          hasRedirectedToLogin = true;
          window.location.replace("/login?session=expired");
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];
let hasRedirectedToLogin = false;

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

export default api;