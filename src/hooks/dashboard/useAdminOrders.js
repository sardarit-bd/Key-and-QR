import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';

export const ADMIN_ORDERS_KEYS = {
  all: ['admin-orders'],
  list: (filters) => ['admin-orders', 'list', filters],
  stats: ['admin-orders', 'stats'],
  detail: (orderId) => ['admin-orders', 'detail', orderId],
};

/** Fetch paginated + filtered orders */
export function useAdminOrders(filters = {}) {
  return useQuery({
    queryKey: ADMIN_ORDERS_KEYS.list(filters),
    queryFn: async () => {
      const res = await adminOrdersService.getOrders(filters);
      return res;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/** Fetch order stats for summary cards */
export function useAdminOrdersStats() {
  return useQuery({
    queryKey: ADMIN_ORDERS_KEYS.stats,
    queryFn: async () => {
      const res = await adminOrdersService.getStats();
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/** Fetch a single order for detail view */
export function useAdminOrderDetail(orderId, options = {}) {
  return useQuery({
    queryKey: ADMIN_ORDERS_KEYS.detail(orderId),
    queryFn: async () => {
      const res = await adminOrdersService.getOrderById(orderId);
      return res.data;
    },
    enabled: !!orderId && options.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Mutations for order management actions */
export function useAdminOrderActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEYS.all });
  };

  const updateFulfillmentStatus = useMutation({
    mutationFn: async ({ orderId, fulfillmentStatus, changeReason }) => {
      queryClient.setQueriesData({ queryKey: ADMIN_ORDERS_KEYS.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((o) =>
            o._id === orderId ? { ...o, fulfillmentStatus } : o
          ),
        };
      });
      const res = await adminOrdersService.updateFulfillmentStatus({ orderId, fulfillmentStatus, changeReason });
      return res.data;
    },
    onSettled: invalidate,
  });

  const cancelOrder = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      queryClient.setQueriesData({ queryKey: ADMIN_ORDERS_KEYS.all }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((o) =>
            o._id === orderId ? { ...o, fulfillmentStatus: 'cancelled', cancellationReason: reason } : o
          ),
        };
      });
      const res = await adminOrdersService.cancelOrder({ orderId, reason });
      return res.data;
    },
    onSettled: invalidate,
  });

  const deleteOrder = useMutation({
    mutationFn: async ({ orderId }) => {
      // Backend doesn't support order deletion — map to cancel
      const res = await adminOrdersService.cancelOrder({ orderId, reason: 'Order deleted by admin' });
      return res.data;
    },
    onSettled: invalidate,
  });

  const createManualOrder = useMutation({
    mutationFn: async (payload) => {
      const res = await adminOrdersService.createManualOrder(payload);
      return res.data;
    },
    onSettled: invalidate,
  });

  return { updateFulfillmentStatus, cancelOrder, deleteOrder, createManualOrder };
}
