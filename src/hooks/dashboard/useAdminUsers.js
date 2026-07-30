import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/dashboard-service/admin-users.service';

export const ADMIN_USERS_KEYS = {
  all: ['admin-users'],
  list: (filters) => ['admin-users', 'list', filters],
  stats: ['admin-users', 'stats'],
  detail: (userId) => ['admin-users', 'detail', userId],
};

/**
 * Fetch paginated + filtered users from the backend.
 */
export function useAdminUsers(filters = {}) {
  return useQuery({
    queryKey: ADMIN_USERS_KEYS.list(filters),
    queryFn: async () => {
      const res = await adminUsersService.getUsers(filters);
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch aggregate user stats for summary cards.
 */
export function useAdminUsersStats() {
  return useQuery({
    queryKey: ADMIN_USERS_KEYS.stats,
    queryFn: async () => {
      const res = await adminUsersService.getStats();
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch a single user by ID (for detail dialogs).
 */
export function useAdminUserDetail(userId, options = {}) {
  const { enabled = false } = options;

  return useQuery({
    queryKey: ADMIN_USERS_KEYS.detail(userId),
    queryFn: async () => {
      const res = await adminUsersService.getUserById({ userId });
      return res.data;
    },
    enabled: !!userId && enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Mutations for user management actions.
 */
export function useAdminUserActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
  };

  const suspendUser = useMutation({
    mutationFn: async ({ userId, reason }) => {
      queryClient.setQueriesData(
        { queryKey: ADMIN_USERS_KEYS.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.map((u) =>
              u._id === userId ? { ...u, isSuspended: true } : u
            ),
          };
        }
      );
      const res = await adminUsersService.suspendUser({ userId, reason });
      return res.data;
    },
    onSettled: invalidate,
  });

  const activateUser = useMutation({
    mutationFn: async ({ userId }) => {
      queryClient.setQueriesData(
        { queryKey: ADMIN_USERS_KEYS.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.map((u) =>
              u._id === userId ? { ...u, isSuspended: false } : u
            ),
          };
        }
      );
      const res = await adminUsersService.activateUser({ userId });
      return res.data;
    },
    onSettled: invalidate,
  });

  const deleteUser = useMutation({
    mutationFn: async ({ userId }) => {
      const res = await adminUsersService.deleteUser({ userId });
      return res.data;
    },
    onSettled: invalidate,
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, updates }) => {
      queryClient.setQueriesData(
        { queryKey: ADMIN_USERS_KEYS.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.map((u) =>
              u._id === userId ? { ...u, ...updates } : u
            ),
          };
        }
      );
      const res = await adminUsersService.updateUser({ userId, updates });
      return res.data;
    },
    onSettled: invalidate,
  });

  return { suspendUser, activateUser, deleteUser, updateUser };
}
