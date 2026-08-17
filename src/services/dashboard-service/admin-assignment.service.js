import api from '@/lib/api';

/**
 * Admin Tag Assignment Service
 *
 * Integrates with existing backend to find and assign tags to orders.
 * Uses: GET /tags (with unused=true), PATCH /tags/:id, 
 *       POST /orders/:id/tags/add, DELETE /orders/:id/tags/:tagId/remove
 */
export const adminAssignmentService = {
  /** Fetch unassigned tags (not assigned to any active order) */
  getUnassignedTags: async ({ page = 1, limit = 10, search = '' } = {}) => {
    const params = { page, limit, unused: 'true' };
    if (search) params.search = search;
    const response = await api.get('/tags', { params });
    const raw = response.data?.data;
    const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    const meta = raw?.meta || response.data?.meta || {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      totalPage: Math.ceil(data.length / limit) || 1,
    };
    return {
      data,
      meta,
    };
  },

  /** Search for orders to assign to */
  searchOrders: async ({ page = 1, limit = 10, search = '', fulfillmentStatus = '' } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (fulfillmentStatus) params.fulfillmentStatus = fulfillmentStatus;
    const response = await api.get('/orders/admin/all', { params });
    return response.data;
  },

  /** Assign a tag to an order */
  assignTagToOrder: async ({ orderId, tagId } = {}) => {
    const response = await api.post(`/orders/${orderId}/tags/add`, { tagId });
    return response.data;
  },

  /** Remove/unassign a tag from an order */
  unassignTagFromOrder: async ({ orderId, tagId } = {}) => {
    const response = await api.delete(`/orders/${orderId}/tags/${tagId}/remove`);
    return response.data;
  },

  /** Update tag (mark as active/inactive) */
  updateTag: async ({ id, payload } = {}) => {
    const response = await api.patch(`/tags/${id}`, payload);
    return response.data;
  },
};

export default adminAssignmentService;
