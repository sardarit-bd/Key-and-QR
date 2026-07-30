import api from '@/lib/api';

export const adminQuotesService = {
  /** Fetch main (curated) quotes with search/pagination */
  getQuotes: async ({ search = '', category = 'all', isActive, page = 1, limit = 10 } = {}) => {
    const params = { search, page, limit };
    if (category && category !== 'all') params.category = category;
    if (isActive !== undefined && isActive !== 'all') params.isActive = isActive;
    const response = await api.get('/quotes', { params });
    return response.data;
  },

  /** Fetch pending quotes with status filter */
  getPendingQuotes: async ({ search = '', status = '', page = 1, limit = 10 } = {}) => {
    const params = { search, page, limit };
    if (status) params.status = status;
    const response = await api.get('/pending-quotes', { params });
    return response.data;
  },

  /** Approve a pending quote */
  approveQuote: async (id, adminNote = '') => {
    const response = await api.patch(`/pending-quotes/${id}/approve`, { adminNote });
    return response.data;
  },

  /** Reject a pending quote */
  rejectQuote: async (id, adminNote = '') => {
    const response = await api.patch(`/pending-quotes/${id}/reject`, { adminNote });
    return response.data;
  },

  /** Delete a pending quote */
  deletePendingQuote: async (id) => {
    const response = await api.delete(`/pending-quotes/${id}`);
    return response.data;
  },

  /** Toggle main quote active status */
  toggleQuoteActive: async (id) => {
    const response = await api.patch(`/quotes/${id}/toggle`);
    return response.data;
  },

  /** Delete a main quote */
  deleteQuote: async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
  },
};

export default adminQuotesService;
