import api from '@/lib/api';

/**
 * Admin Users Service
 *
 * All user management data flows through this service to the backend.
 */
export const adminUsersService = {
  /** Fetch paginated, filtered user list */
  getUsers: async ({
    search = '',
    role = '',
    status = '',
    sort = 'newest',
    page = 1,
    limit = 10,
  } = {}) => {
    const response = await api.get('/admin/users', {
      params: { search, role, status, sort, page, limit },
    });
    return response.data;
  },

  /** Fetch aggregate user stats for summary cards */
  getStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  /** Get a single user by ID */
  getUserById: async ({ userId } = {}) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  /** Suspend a user */
  suspendUser: async ({ userId, reason } = {}) => {
    const response = await api.patch(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  /** Activate a previously suspended user */
  activateUser: async ({ userId } = {}) => {
    const response = await api.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },

  /** Delete a user (soft delete) */
  deleteUser: async ({ userId } = {}) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /** Update user profile fields */
  updateUser: async ({ userId, updates } = {}) => {
    const response = await api.patch(`/admin/users/${userId}`, updates);
    return response.data;
  },
};

export default adminUsersService;
