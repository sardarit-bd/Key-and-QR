'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category-service/category.service';
import { adminQuotesService } from '@/services/dashboard-service/admin-quotes.service';

export const ADMIN_CATEGORIES_KEYS = {
  all: ['admin-categories'],
  list: (filters) => ['admin-categories', 'list', filters],
  quoteCounts: ['admin-categories', 'quote-counts'],
};

/**
 * Fetch paginated + filtered categories (includes inactive).
 * Returns the envelope { meta, data } where data is the category array.
 * Note: getAdminCategories returns response.data = { success, message, meta, data }.
 * We return that whole envelope so consumers read data?.data and data?.meta.
 */
export function useAdminCategories(filters = {}) {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_KEYS.list(filters),
    queryFn: async () => {
      const res = await categoryService.getAdminCategories(filters);
      return res; // { meta, data } envelope
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch the count of quotes per category slug (client-side aggregation).
 * The Quote model stores category as a slug string, and GET /quotes
 * supports ?category=<slug>, so we aggregate per category.
 */
export function useAdminCategoryQuoteCounts() {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_KEYS.quoteCounts,
    queryFn: async () => {
      const res = await categoryService.getAdminCategories({ page: 1, limit: 100 });
      const categories = res?.data || [];
      const counts = {};

      categories.forEach((cat) => {
        const count = cat.quotesCount ?? cat.quoteCount ?? 0;
        if (cat.slug) counts[cat.slug] = count;
        if (cat._id) counts[cat._id] = count;
      });

      return {
        categories,
        counts,
        data: counts,
        totalQuotes: res?.meta?.totalQuotes ?? 0,
      };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Mutations for category management (admin).
 * All invalidate the shared key on settle.
 */
export function useAdminCategoryActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ['quote-categories'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createCategory = useMutation({
    mutationFn: async (payload) => {
      const res = await categoryService.createCategory(payload);
      return res.data;
    },
    onSettled: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await categoryService.updateCategory(id, payload);
      return res.data;
    },
    onSettled: invalidate,
  });

  const toggleCategory = useMutation({
    mutationFn: async (id) => {
      const res = await categoryService.toggleCategoryActive(id);
      return res.data;
    },
    onSettled: invalidate,
  });

  const reorderCategories = useMutation({
    mutationFn: async (orderedIds) => {
      const res = await categoryService.reorderCategories(orderedIds);
      return res.data;
    },
    onSettled: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      const res = await categoryService.deleteCategory(id);
      return res.data;
    },
    onSettled: invalidate,
  });

  return { createCategory, updateCategory, toggleCategory, reorderCategories, deleteCategory };
}
