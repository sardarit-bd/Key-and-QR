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
};