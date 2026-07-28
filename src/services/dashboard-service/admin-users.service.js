import api from '@/lib/api';
import { MOCK_ADMIN_USERS, MOCK_USERS_STATS } from './mock-admin-users';

/**
 * Admin Users Service
 *
 * All user management data flows through this service.
 * Set useMock=false once the backend endpoints exist.
 */
function simulateLatency() {
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
}

export const adminUsersService = {
  /** Fetch paginated, filtered user list */
  getUsers: async ({
    useMock = true,
    search = '',
    role = '',
    status = '',
    sort = 'newest',
    page = 1,
    limit = 10,
  } = {}) => {
    if (!useMock) {
      const response = await api.get('/admin/users', {
        params: { search, role, status, sort, page, limit },
      });
      return response.data;
    }

    await simulateLatency();

    let filtered = [...MOCK_ADMIN_USERS];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (role && role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((u) => u.status === status);
    }

    // Sort
    if (sort === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      filtered.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return {
      data: {
        users: items,
        pagination: {
          page: safePage,
          limit,
          totalItems,
          totalPages,
        },
      },
    };
  },

  /** Fetch aggregate user stats for summary cards */
  getStats: async ({ useMock = true } = {}) => {
    if (!useMock) {
      const response = await api.get('/admin/users/stats');
      return response.data;
    }

    await simulateLatency();
    return { data: MOCK_USERS_STATS };
  },

  /** Suspend a user */
  suspendUser: async ({ useMock = true, userId, reason } = {}) => {
    if (!useMock) {
      const response = await api.patch(`/admin/users/${userId}/suspend`, { reason });
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: userId, status: 'suspended' } };
  },

  /** Activate a previously suspended user */
  activateUser: async ({ useMock = true, userId } = {}) => {
    if (!useMock) {
      const response = await api.patch(`/admin/users/${userId}/activate`);
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: userId, status: 'active' } };
  },

  /** Delete a user */
  deleteUser: async ({ useMock = true, userId } = {}) => {
    if (!useMock) {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: userId, deleted: true } };
  },

  /** Get a single user by ID */
  getUserById: async ({ useMock = true, userId } = {}) => {
    if (!useMock) {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    }

    await simulateLatency();
    const user = MOCK_ADMIN_USERS.find((u) => u._id === userId);
    return { data: user || null };
  },

  /** Update user profile fields */
  updateUser: async ({ useMock = true, userId, updates } = {}) => {
    if (!useMock) {
      const response = await api.patch(`/admin/users/${userId}`, updates);
      return response.data;
    }

    await simulateLatency();
    return { data: { _id: userId, ...updates } };
  },
};

export default adminUsersService;
