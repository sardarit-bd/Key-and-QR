import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const quoteAssignmentKeys = {
  all: ['quote-assignments'],
  list: (filters) => [...quoteAssignmentKeys.all, 'list', filters],
  byQuote: (quoteId) => [...quoteAssignmentKeys.all, 'quote', quoteId],
  quotes: (search) => ['assignable-quotes', search],
  tags: (search) => ['assignable-tags', search],
  users: (search) => ['assignable-users', search],
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
 * Fetch assignable (active) quotes -> Promise<Quote[]>
 */
export function useAssignableQuotes({ search = '', limit = 30 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.quotes(search),
    queryFn: async () => {
      const params = { limit, isActive: true };
      if (search) params.search = search;
      const res = await api.get('/quotes', { params });
      return normalizeList(res.data?.data, 'quotes');
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch assignable QR tags -> Promise<Tag[]>
 */
export function useAssignableTags({ search = '', limit = 50 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.tags(search),
    queryFn: async () => {
      const params = { limit };
      if (search) params.search = search;
      const res = await api.get('/tags', { params });
      return normalizeList(res.data?.data, 'tags');
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch assignable users -> Promise<User[]>
 */
export function useAssignableUsers({ search = '', limit = 50 } = {}) {
  return useQuery({
    queryKey: quoteAssignmentKeys.users(search),
    queryFn: async () => {
      const params = { limit };
      if (search) params.search = search;
      const res = await api.get('/admin/users', { params });
      return normalizeList(res.data?.data, 'users');
    },
    staleTime: 60 * 1000,
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
    },
  });
}
