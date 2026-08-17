import api from '@/lib/api';

/**
 * Admin Tags Service
 *
 * Integrates with the existing backend tag APIs.
 * Backend takes query params: page, limit, search, isActivated, isActive
 * Endpoints: GET /tags, GET /tags/:tagCode, POST /tags, PATCH /tags/:id
 */
export const adminTagsService = {
  /** Fetch paginated, filterable tags */
  getTags: async ({ page = 1, limit = 10, search = '', isActivated, isActive, status } = {}) => {
    const params = { page, limit };

    if (search) params.search = search;
    if (isActivated !== undefined && isActivated !== 'all') {
      params.isActivated = isActivated;
    }
    if (isActive !== undefined && isActive !== 'all') {
      params.isActive = isActive;
    }
    if (status !== undefined && status !== 'all') {
      params.status = status;
    }

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

  /** Get a single tag by code */
  getTagByCode: async (tagCode) => {
    const response = await api.get(`/tags/${tagCode}`);
    return response.data; // { data: tag }
  },

  /** Create a new tag */
  createTag: async (payload) => {
    const response = await api.post('/tags', payload);
    return response.data;
  },

  /** Bulk generate QR tags */
  bulkGenerateTags: async ({ quantity, prefix = 'TAG' }) => {
    const response = await api.post('/tags/bulk-generate', { quantity, prefix });
    return response.data;
  },

  /** Update a tag (isActive, subscriptionType) */
  updateTag: async (id, payload) => {
    const response = await api.patch(`/tags/${id}`, payload);
    return response.data;
  },

  /** Fetch assigned tags (activated + with owner) — server-side pagination + filter */
  getAssignedTags: async ({ page = 1, limit = 10, search = '', subscriptionType = '' } = {}) => {
    const params = { page, limit, isActivated: 'true', isActive: 'true' };
    if (search) params.search = search;
    if (subscriptionType && subscriptionType !== 'all') params.subscriptionType = subscriptionType;

    const response = await api.get('/tags', { params });
    const result = response.data?.data;
    return {
      meta: result?.meta || { page: 1, limit, total: 0, totalPage: 0 },
      data: result?.data || [],
    };
  },

  /** Get tag lifecycle stats (fetches all, computes client-side) */
  getStats: async () => {
    const response = await api.get('/tags', { params: { limit: 1000 } });
    const tags = response.data?.data?.data || [];
    return {
      total: tags.length,
      activated: tags.filter((t) => t.isActivated).length,
      pending: tags.filter((t) => !t.isActivated && t.isActive).length,
      disabled: tags.filter((t) => !t.isActive).length,
      free: tags.filter((t) => t.subscriptionType === 'free').length,
      subscriber: tags.filter((t) => t.subscriptionType === 'subscriber').length,
      assigned: tags.filter((t) => t.owner).length,
      unassigned: tags.filter((t) => !t.owner).length,
    };
  },

  /** Bulk unassign tags — calls Order module for full synchronization */
  bulkUnassign: async (tagIds) => {
    const response = await api.post('/orders/bulk-unassign', { tagIds });
    return response.data;
  },
};

export default adminTagsService;
