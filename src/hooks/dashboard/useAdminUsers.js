import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/dashboard-service/admin-users.service';

export const ADMIN_USERS_KEYS = {
  all: ['admin-users'],
  list: (filters) => ['admin-users', 'list', filters],
  stats: ['admin-users', 'stats'],
  detail: (userId) => ['admin-users', 'detail', userId],
};

/**
 * Fetch paginated + filtered users for the admin users table.
 */
export function useAdminUsers(filters = {}, options = {}) {
  const { useMock = true } = options;

  return useQuery({
    queryKey: ADMIN_USERS_KEYS.list(filters),
    queryFn: async () => {
      const res = await adminUsersService.getUsers({ useMock, ...filters });
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
export function useAdminUsersStats(options = {}) {
  const { useMock = true } = options;

  return useQuery({
    queryKey: ADMIN_USERS_KEYS.stats,
    queryFn: async () => {
      const res = await adminUsersService.getStats({ useMock });
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch a single user by ID (for detail/edit dialogs).
 */
export function useAdminUserDetail(userId, options = {}) {
  const { useMock = true, enabled = false } = options;

  return useQuery({
    queryKey: ADMIN_USERS_KEYS.detail(userId),
    queryFn: async () => {
      const res = await adminUsersService.getUserById({ useMock, userId });
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
export function useAdminUserActions(options = {}) {
  const { useMock = true } = options;
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEYS.all });
  };

  const suspendUser = useMutation({
    mutationFn: async ({ userId, reason }) => {
      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: ADMIN_USERS_KEYS.all },
        (old) => {
          if (!old?.users) return old;
          return {
            ...old,
            users: old.users.map((u) =>
              u._id === userId ? { ...u, status: 'suspended' } : u
            ),
          };
        }
      );
      const res = await adminUsersService.suspendUser({ useMock, userId, reason });
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
              u._id === userId ? { ...u, status: 'active' } : u
            ),
          };
        }
      );
      const res = await adminUsersService.activateUser({ useMock, userId });
      return res.data;
    },
    onSettled: invalidate,
  });

  const deleteUser = useMutation({
    mutationFn: async ({ userId }) => {
      const res = await adminUsersService.deleteUser({ useMock, userId });
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
      const res = await adminUsersService.updateUser({ useMock, userId, updates });
      return res.data;
    },
    onSettled: invalidate,
  });

  return { suspendUser, activateUser, deleteUser, updateUser };
}
