import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAssignmentService } from '@/services/dashboard-service/admin-assignment.service';

export const ADMIN_ASSIGNMENT_KEYS = {
  unassignedTags: (filters) => ['admin-assignment', 'unassigned-tags', filters],
  searchOrders: (filters) => ['admin-assignment', 'search-orders', filters],
};

/** Fetch unassigned tags */
export function useUnassignedTags(filters = {}) {
  return useQuery({
    queryKey: ADMIN_ASSIGNMENT_KEYS.unassignedTags(filters),
    queryFn: async () => {
      const res = await adminAssignmentService.getUnassignedTags(filters);
      return res; // { data, meta }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/** Search for assignable orders */
export function useSearchOrders(filters = {}) {
  return useQuery({
    queryKey: ADMIN_ASSIGNMENT_KEYS.searchOrders(filters),
    queryFn: async () => {
      const res = await adminAssignmentService.searchOrders(filters);
      return res;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    enabled: false, // Only fetch when explicitly triggered
  });
}

/** Mutations for assignment actions */
export function useAdminAssignmentActions() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-assignment'] });
    queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  };

  const assignTag = useMutation({
    mutationFn: async ({ orderId, tagId }) => {
      const res = await adminAssignmentService.assignTagToOrder({ orderId, tagId });
      return res.data;
    },
    onSettled: invalidateAll,
  });

  const unassignTag = useMutation({
    mutationFn: async ({ orderId, tagId }) => {
      const res = await adminAssignmentService.unassignTagFromOrder({ orderId, tagId });
      return res.data;
    },
    onSettled: invalidateAll,
  });

  return { assignTag, unassignTag };
}
