import api from "@/lib/api";

export const orderService = {
    /**
     * Create checkout - Creates order only (not Stripe session)
     * Payment session is created via payment service
     */
    createCheckout: async (orderData) => {
        try {
            const response = await api.post("/orders/checkout", orderData);
            return response.data;
        } catch (error) {
            console.error("Checkout error:", error);
            throw error;
        }
    },

    /**
     * Get order status
     */
    getOrderStatus: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Order status error:", error);
            throw error;
        }
    },

    /**
     * Get user orders
     */
    getUserOrders: async (params = {}) => {
        try {
            const { page = 1, limit = 10 } = params;
            const response = await api.get("/orders", {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            console.error("Get orders error:", error);
            throw error;
        }
    },

    /**
     * Update order address
     */
    updateOrderAddress: async (orderId, addressData) => {
        try {
            const response = await api.patch(`/orders/${orderId}/address`, addressData);
            return response.data;
        } catch (error) {
            console.error("Update order address error:", error);
            throw error;
        }
    },

    /**
     * Update order
     */
    updateOrder: async (orderId, updateData) => {
        try {
            const response = await api.patch(`/orders/${orderId}`, updateData);
            return response.data;
        } catch (error) {
            console.error("Update order error:", error);
            throw error;
        }
    },

    /**
     * Cancel order
     */
    cancelOrder: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error("Cancel order error:", error);
            throw error;
        }
    },

    /**
     * Request refund
     */
    requestRefund: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/refund/request`, { reason });
            return response.data;
        } catch (error) {
            console.error("Request refund error:", error);
            throw error;
        }
    },

    /**
     * Request return
     */
    requestReturn: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/return/request`, { reason });
            return response.data;
        } catch (error) {
            console.error("Request return error:", error);
            throw error;
        }
    },

    /**
     * Claim gift
     */
    claimGift: async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/claim-gift`);
            return response.data;
        } catch (error) {
            console.error("Claim gift error:", error);
            throw error;
        }
    },
};

export default orderService;