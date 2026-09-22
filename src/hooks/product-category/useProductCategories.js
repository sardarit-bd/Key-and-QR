import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productCategoryService from '@/services/product-category-service/productCategory.service';

export const productCategoryKeys = {
  all: ['product-categories'],
  lists: () => [...productCategoryKeys.all, 'list'],
  list: (params) => [...productCategoryKeys.lists(), params],
  adminLists: () => [...productCategoryKeys.all, 'admin-list'],
  adminList: (params) => [...productCategoryKeys.adminLists(), params],
  detail: (id) => [...productCategoryKeys.all, 'detail', id],
};

/**
 * Public & Shop hook to fetch active physical product categories
 */
export function useProductCategories(params = {}) {
  return useQuery({
    queryKey: productCategoryKeys.list(params),
    queryFn: () => productCategoryService.getAllCategories(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Admin hook to fetch physical product categories with full filters (including inactive)
 */
export function useAdminProductCategories(params = {}) {
  return useQuery({
    queryKey: productCategoryKeys.adminList(params),
    queryFn: () => productCategoryService.getAdminCategories(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Mutations for Product Category management (Add/Edit/Delete/Toggle)
 */
export function useProductCategoryActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: productCategoryKeys.all });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const createCategory = useMutation({
    mutationFn: (payload) => productCategoryService.createCategory(payload),
    onSettled: invalidate,
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, ...payload }) => productCategoryService.updateCategory(id, payload),
    onSettled: invalidate,
  });

  const toggleCategory = useMutation({
    mutationFn: (id) => productCategoryService.toggleCategoryActive(id),
    onSettled: invalidate,
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => productCategoryService.deleteCategory(id),
    onSettled: invalidate,
  });

  const reorderCategories = useMutation({
    mutationFn: (orderedIds) => productCategoryService.reorderCategories(orderedIds),
    onSettled: invalidate,
  });

  return {
    createCategory,
    updateCategory,
    toggleCategory,
    deleteCategory,
    reorderCategories,
  };
}

export default useProductCategories;
