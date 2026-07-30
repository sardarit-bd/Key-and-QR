import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductsService } from '@/services/dashboard-service/admin-products.service';

export const ADMIN_PRODUCTS_KEYS = {
  all: ['admin-products'],
  list: (filters) => ['admin-products', 'list', filters],
  categories: ['admin-products', 'categories'],
  detail: (id) => ['admin-products', 'detail', id],
};

/** Fetch paginated + filtered products */
export function useAdminProducts(filters = {}) {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_KEYS.list(filters),
    queryFn: async () => {
      const res = await adminProductsService.getProducts(filters);
      return res; // { meta, data }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}

/** Fetch categories for the filter dropdown */
export function useAdminProductCategories() {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_KEYS.categories,
    queryFn: async () => {
      const res = await adminProductsService.getCategories();
      return res.data; // [{ id, name }]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/** Fetch a single product by ID */
export function useAdminProductDetail(id, options = {}) {
  return useQuery({
    queryKey: ADMIN_PRODUCTS_KEYS.detail(id),
    queryFn: async () => {
      const res = await adminProductsService.getProductById(id);
      return res.data;
    },
    enabled: !!id && options.enabled !== false,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/** Mutations for product management */
export function useAdminProductActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_KEYS.categories });
  };

  const createProduct = useMutation({
    mutationFn: async (formData) => {
      const res = await adminProductsService.createProduct(formData);
      return res.data;
    },
    onSettled: invalidate,
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await adminProductsService.updateProduct(id, formData);
      return res.data;
    },
    onSettled: invalidate,
  });

  const deleteProduct = useMutation({
    mutationFn: async (id) => {
      const res = await adminProductsService.deleteProduct(id);
      return res.data;
    },
    onSettled: invalidate,
  });

  const restoreProduct = useMutation({
    mutationFn: async (id) => {
      const res = await adminProductsService.restoreProduct(id);
      return res.data;
    },
    onSettled: invalidate,
  });

  const permanentDeleteProduct = useMutation({
    mutationFn: async (id) => {
      const res = await adminProductsService.permanentDeleteProduct(id);
      return res.data;
    },
    onSettled: invalidate,
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    restoreProduct,
    permanentDeleteProduct,
  };
}
