import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const quoteAssignmentKeys = {
  all: ['quote-assignments'],
  list: (filters) => [...quoteAssignmentKeys.all, 'list', filters],
  byQuote: (quoteId) => [...quoteAssignmentKeys.all, 'quote', quoteId],
  quotes: (params) => ['assignable-quotes', params],
  tags: (params) => ['assignable-tags', params],
  users: (params) => ['assignable-users', params],
};

/**
 * Helper to unwrap list array from various backend response conventions:
 * - Direct array: [ ... ]
 * - Nested in data: { data: [ ... ] }
 * - Named keys: { tags: [ ... ] }, { users: [ ... ] }, { quotes: [ ... ] }
 */
function normalizeList(responsePayload, namedKey) {
  if (!responsePayload) return [];
  if (Array.isArray(responsePayload)) return responsePayload;
  if (Array.isArray(responsePayload.data)) return responsePayload.data;
  if (namedKey && Array.isArray(responsePayload[namedKey])) return responsePayload[namedKey];
  if (Array.isArray(responsePayload.items)) return responsePayload.items;
  return [];
}

/**
 * Fetch assignable (active) quotes with server pagination -> Promise<{ data: Quote[], meta: Meta }>
 */
export function useAssignableQuotes({ search = '', page = 1, limit = 6 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.quotes({ search, page, limit }),
    queryFn: async () => {
      const params = { page, limit, isActive: true };
      if (search) params.search = search;
      const res = await api.get('/quotes', { params });
      const raw = res.data?.data;
      const data = normalizeList(raw, 'quotes');
      const meta =
        res.data?.meta ||
        raw?.meta || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.length,
          totalPage: Math.ceil(data.length / limit) || 1,
        };
      return {
        data,
        meta: {
          page: parseInt(meta.page) || 1,
          limit: parseInt(meta.limit) || limit,
          total: parseInt(meta.total) || 0,
          totalPage: parseInt(meta.totalPage) || 1,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch assignable QR tags with server pagination -> Promise<{ data: Tag[], meta: Meta }>
 */
export function useAssignableTags({ search = '', page = 1, limit = 10 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.tags({ search, page, limit }),
    queryFn: async () => {
      const params = { page, limit };
      if (search) params.search = search;
      const res = await api.get('/tags', { params });
      const raw = res.data?.data;
      const data = normalizeList(raw, 'tags');
      const meta =
        res.data?.meta ||
        raw?.meta || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.length,
          totalPage: Math.ceil(data.length / limit) || 1,
        };
      return {
        data,
        meta: {
          page: parseInt(meta.page) || 1,
          limit: parseInt(meta.limit) || limit,
          total: parseInt(meta.total) || 0,
          totalPage: parseInt(meta.totalPage) || 1,
        },
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch assignable users with server pagination -> Promise<{ data: User[], meta: Meta }>
 */
export function useAssignableUsers({ search = '', page = 1, limit = 10 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.users({ search, page, limit }),
    queryFn: async () => {
      const params = { page, limit };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      const raw = res.data?.data;
      const data = normalizeList(raw, 'users');
      const pagination = raw?.pagination || res.data?.pagination;
      const meta = {
        page: parseInt(pagination?.page || page),
        limit: parseInt(pagination?.limit || limit),
        total: parseInt(pagination?.totalItems || data.length),
        totalPage: parseInt(pagination?.totalPages || Math.ceil((pagination?.totalItems || data.length) / limit) || 1),
      };
      return {
        data,
        meta,
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch quote assignments with filtering and pagination
 */
export function useQuoteAssignments(filters = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.list(filters),
    queryFn: async () => {
      const res = await api.get('/quote-assignments', { params: filters });
      const raw = res.data?.data;
      const data = normalizeList(raw, 'assignments');
      const meta =
        res.data?.meta ||
        raw?.meta || { total: data.length, page: 1, limit: 10, totalPage: 1 };
      return {
        data,
        meta,
      };
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Bulk assign quote to multiple recipients (Tags or Users)
 */
export function useBulkAssignQuotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/quote-assignments/bulk', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteAssignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['assignable-tags'] });
      queryClient.invalidateQueries({ queryKey: ['assignable-users'] });
    },
  });
}

/**
 * Delete a single assignment
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/quote-assignments/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteAssignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['assignable-tags'] });
      queryClient.invalidateQueries({ queryKey: ['assignable-users'] });
    },
  });
}

/**
 * Bulk delete assignments
 */
export function useBulkDeleteAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids) => {
      const res = await api.post('/quote-assignments/bulk-delete', { ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteAssignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['assignable-tags'] });
      queryClient.invalidateQueries({ queryKey: ['assignable-users'] });
    },
  });
}
