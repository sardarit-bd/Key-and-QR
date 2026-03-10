import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // for cookies
});

// Request interceptor for access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await api.post("/auth/refresh-token");
                const { accessToken } = response.data.data;

                localStorage.setItem("accessToken", accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed - redirect to login
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;