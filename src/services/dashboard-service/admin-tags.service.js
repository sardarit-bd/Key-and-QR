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
  getTags: async ({ page = 1, limit = 10, search = '', isActivated, isActive } = {}) => {
    const params = { page, limit };

    if (search) params.search = search;
    if (isActivated !== undefined && isActivated !== 'all') {
      params.isActivated = isActivated;
    }
    if (isActive !== undefined && isActive !== 'all') {
      params.isActive = isActive;
    }

    const response = await api.get('/tags', { params });
    return response.data; // { data: { meta, data } }
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

  /** Update a tag (isActive, subscriptionType) */
  updateTag: async (id, payload) => {
    const response = await api.patch(`/tags/${id}`, payload);
    return response.data;
  },

  /** Fetch assigned tags (activated + with owner) */
  getAssignedTags: async ({ page = 1, limit = 10, search = '', subscriptionType = '' } = {}) => {
    const params = { page, limit, isActivated: 'true', isActive: 'true' };
    if (search) params.search = search;

    const response = await api.get('/tags', { params });
    const result = response.data;
    let tags = result?.data?.data || [];

    if (subscriptionType && subscriptionType !== 'all') {
      tags = tags.filter((t) => t.subscriptionType === subscriptionType);
    }

    const totalItems = tags.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return {
      meta: { page, limit, total: totalItems, totalPage: totalPages },
      data: tags,
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
};

export default adminTagsService;
