import api from '@/lib/api';

/**
 * Admin Orders Service
 *
 * Fully backend-driven. No mock data.
 * Uses the existing backend /orders/admin/* endpoints.
 */
export const adminOrdersService = {
  /** Fetch paginated, filtered order list */
  getOrders: async ({ search = '', fulfillmentStatus = '', paymentStatus = '', sort = 'newest', page = 1, limit = 10 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (fulfillmentStatus && fulfillmentStatus !== 'all') params.fulfillmentStatus = fulfillmentStatus;

    const response = await api.get('/orders/admin/all', { params });
    // Backend returns: { data: [...], meta: { page, limit, total, totalPage } }
    return response.data;
  },

  /** Fetch aggregate order stats */
  getStats: async () => {
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  /** Get a single order by ID */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /** Update fulfillment status */
  updateFulfillmentStatus: async ({ orderId, fulfillmentStatus, changeReason } = {}) => {
    const response = await api.patch(`/orders/${orderId}`, { fulfillmentStatus, changeReason });
    return response.data;
  },

  /** Cancel an order */
  cancelOrder: async ({ orderId, reason } = {}) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  /** Remove tag from order (used during unassignment) */
  removeTagFromOrder: async ({ orderId, tagId } = {}) => {
    const response = await api.delete(`/orders/${orderId}/tags/${tagId}/remove`);
    return response.data;
  },

  /** Add tag to order (used during assignment) */
  addTagToOrder: async ({ orderId, tagId } = {}) => {
    const response = await api.post(`/orders/${orderId}/tags/add`, { tagId });
    return response.data;
  },
};

export default adminOrdersService;
