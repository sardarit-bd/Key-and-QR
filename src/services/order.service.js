import api from "@/lib/api";

export const orderService = {
    createCheckout: async (orderData) => {
        try {
            const response = await api.post("/orders/checkout", orderData);
            return response.data;
        } catch (error) {
            console.error("Checkout error:", error);
            throw error;
        }
    },

    getOrderStatus: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Order status error:", error);
            throw error;
        }
    },

    getUserOrders: async () => {
        try {
            const response = await api.get("/orders");
            return response.data;
        } catch (error) {
            console.error("Get orders error:", error);
            throw error;
        }
    },

    updateOrderAddress: async (orderId, addressData) => {
        try {
            const response = await api.patch(`/orders/${orderId}/address`, addressData);
            return response.data;
        } catch (error) {
            console.error("Update order address error:", error);
            throw error;
        }
    },

    updateOrder: async (orderId, updateData) => {
        try {
            const response = await api.patch(`/orders/${orderId}`, updateData);
            return response.data;
        } catch (error) {
            console.error("Update order error:", error);
            throw error;
        }
    },

    cancelOrder: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        } catch (error) {
            console.error("Cancel order error:", error);
            throw error;
        }
    },

    requestRefund: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/refund/request`, { reason });
            return response.data;
        } catch (error) {
            console.error("Request refund error:", error);
            throw error;
        }
    },

    requestReturn: async (orderId, reason) => {
        try {
            const response = await api.post(`/orders/${orderId}/return/request`, { reason });
            return response.data;
        } catch (error) {
            console.error("Request return error:", error);
            throw error;
        }
    },

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