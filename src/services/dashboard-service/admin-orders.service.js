import api from '@/lib/api';
import { MOCK_ADMIN_ORDERS, MOCK_ORDERS_STATS } from './mock-admin-orders';

/**
 * Admin Orders Service
 *
 * Wraps the existing backend order APIs with a mock fallback.
 * Set useMock=false to hit the real backend endpoints.
 */
function simulateLatency() {
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
}

export const adminOrdersService = {
  /** Fetch paginated, filtered order list */
  getOrders: async ({
    useMock = true,
    search = '',
    fulfillmentStatus = '',
    paymentStatus = '',
    sort = 'newest',
    page = 1,
    limit = 10,
  } = {}) => {
    if (!useMock) {
      const response = await api.get('/orders/admin/all', {
        params: { search, fulfillmentStatus, page, limit },
      });
      return response.data;
    }

    await simulateLatency();

    let filtered = [...MOCK_ADMIN_ORDERS];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o._id.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.items?.some((it) => it.product?.name?.toLowerCase().includes(q))
      );
    }

    if (fulfillmentStatus && fulfillmentStatus !== 'all') {
      filtered = filtered.filter((o) => o.fulfillmentStatus === fulfillmentStatus);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
    }

    if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      data: items,
      meta: {
        page: safePage,
        limit,
        total: totalItems,
        totalPage: totalPages,
      },
    };
  },

  /** Fetch aggregate order stats */
  getStats: async ({ useMock = true } = {}) => {
    if (!useMock) {
      const response = await api.get('/orders/admin/stats');
      return response.data;
    }

    await simulateLatency();
    return { data: MOCK_ORDERS_STATS };
  },

  /** Get a single order by ID */
  getOrderById: async ({ useMock = true, orderId } = {}) => {
    if (!useMock) {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    }

    await simulateLatency();
    const order = MOCK_ADMIN_ORDERS.find((o) => o._id === orderId);
    return { data: order || null };
  },

  /** Update fulfillment status */
  updateFulfillmentStatus: async ({ useMock = true, orderId, fulfillmentStatus, changeReason } = {}) => {
    if (!useMock) {
      const response = await api.patch(`/orders/${orderId}`, { fulfillmentStatus, changeReason });
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: orderId, fulfillmentStatus } };
  },

  /** Cancel an order */
  cancelOrder: async ({ useMock = true, orderId, reason } = {}) => {
    if (!useMock) {
      const response = await api.post(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: orderId, fulfillmentStatus: 'cancelled', cancellationReason: reason } };
  },

  /** Delete order (mock only — may not exist on backend) */
  deleteOrder: async ({ useMock = true, orderId } = {}) => {
    if (!useMock) {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: orderId, deleted: true } };
  },
};

export default adminOrdersService;
