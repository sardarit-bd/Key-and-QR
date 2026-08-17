import { useQuery } from '@tanstack/react-query';
import categoryService from '@/services/category-service/category.service';

export const quoteCategoryKeys = {
  all: ['quote-categories'],
  list: () => [...quoteCategoryKeys.all, 'list'],
};

// Backwards compatibility alias
export const categoryKeys = quoteCategoryKeys;

/**
 * Get all active quote categories
 * GET /categories
 */
export function useQuoteCategories() {
  return useQuery({
    queryKey: quoteCategoryKeys.list(),
    queryFn: () => categoryService.getAllCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    select: (result) => result?.data || [],
  });
}

