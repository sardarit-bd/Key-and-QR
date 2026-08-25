import { useQuery } from '@tanstack/react-query';
import categoryService from '@/services/category-service/category.service';

export const quoteCategoryKeys = {
  all: ['quote-categories'],
  list: () => [...quoteCategoryKeys.all, 'list'],
  explore: (filters) => ['quotes', 'explore', filters],
};

// Backwards compatibility alias
export const categoryKeys = quoteCategoryKeys;

/**
 * Get all active quote categories
 * GET /categories
 */
export function useQuoteCategories(params = {}) {
  return useQuery({
    queryKey: [...quoteCategoryKeys.list(), params],
    queryFn: () => categoryService.getAllCategories({ limit: 100, ...params }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    select: (result) => result?.data || [],
  });
}

/**
 * Get explore quotes for public inspiration browsing
 * GET /quotes/explore
 */
export function useExploreQuotes({ category, search, sort, page = 1, limit = 12 } = {}) {
  return useQuery({
    queryKey: quoteCategoryKeys.explore({ category, search, sort, page, limit }),
    queryFn: () =>
      categoryService.getExploreQuotes({
        category: category && category !== 'all' ? category : undefined,
        search: search || undefined,
        sort: sort || undefined,
        page,
        limit,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
}

