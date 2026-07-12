import api from "@/lib/api";

/**
 * Auth Service - Handles all authentication API calls
 * 
 * Responsibilities:
 * - Login, Register, Logout
 * - Password management
 * - Social login
 * - User profile
 * - Guest resource management
 */
export const authService = {
    /**
     * Register a new user
     */
    register: async (payload) => {
        const response = await api.post("/auth/register", payload);
        return response.data;
    },

    /**
     * Login user
     */
    login: async (payload) => {
        const response = await api.post("/auth/login", payload);
        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            const response = await api.post("/auth/logout");
            return response.data;
        } catch (error) {
            // Silently fail logout API call
            console.warn("Logout API call failed:", error.message);
            return { success: true };
        }
    },

    /**
     * Refresh access token
     */
    refreshToken: async () => {
        const response = await api.post("/auth/refresh-token");
        return response.data;
    },

    /**
     * Get current user
     */
    getCurrentUser: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    /**
     * Forgot password
     */
    forgotPassword: async (payload) => {
        const response = await api.post("/auth/forgot-password", payload);
        return response.data;
    },

    /**
     * Reset password
     */
    resetPassword: async (payload) => {
        const response = await api.post("/auth/reset-password", payload);
        return response.data;
    },

    /**
     * Change password
     */
    changePassword: async (payload) => {
        const response = await api.post("/auth/change-password", payload);
        return response.data;
    },

    /**
     * Update profile
     */
    updateProfile: async (payload) => {
        const response = await api.patch("/auth/update-profile", payload);
        return response.data;
    },

    /**
     * Upload avatar
     */
    uploadAvatar: async (formData) => {
        const response = await api.post("/auth/upload-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    /**
     * Check guest resources
     */
    checkGuestResources: async () => {
        const response = await api.get("/auth/guest-resources");
        return response.data;
    },

    /**
     * Claim guest resources
     */
    claimGuestResources: async () => {
        const response = await api.post("/auth/claim-guest-resources");
        return response.data;
    },

    /**
     * Google OAuth - Redirect to backend
     */
    googleLogin: () => {
        window.location.href = "/api/auth/google";
    },
};

export default authService;