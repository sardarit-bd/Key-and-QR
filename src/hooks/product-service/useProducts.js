import productService from "@/services/product-service/product.service";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

// ============================================================
// QUERY KEYS
// ============================================================

export const productKeys = {
    all: ['products'],
    lists: () => [...productKeys.all, 'list'],
    list: (filters) => [...productKeys.lists(), { ...filters }],
    details: () => [...productKeys.all, 'detail'],
    detail: (id) => [...productKeys.details(), id],
    featured: () => [...productKeys.all, 'featured'],
    categories: () => [...productKeys.all, 'categories'],
    related: (id) => [...productKeys.all, 'related', id],
};

// ============================================================
// PRODUCT HOOKS
// ============================================================

/**
 * Get all products with filters
 */
export function useProducts(params = {}) {
    const { 
        page = 1, 
        limit = 12, 
        search = '', 
        category = '', 
        sort = 'newest' 
    } = params;

    return useQuery({
        queryKey: productKeys.list({ page, limit, search, category, sort }),
        queryFn: () => productService.getProducts({ page, limit, search, category, sort }),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        placeholderData: (previousData) => previousData,
    });
}

/**
 * Get featured products
 */
export function useFeaturedProducts(limit = 4) {
    return useQuery({
        queryKey: productKeys.featured(),
        queryFn: () => productService.getFeaturedProducts(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    });
}

/**
 * Get single product by ID
 */
export function useProduct(id) {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productService.getProductById(id),
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        enabled: !!id,
    });
}

/**
 * Get related products
 */
export function useRelatedProducts(productId, limit = 4) {
    return useQuery({
        queryKey: productKeys.related(productId),
        queryFn: () => productService.getRelatedProducts(productId, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        enabled: !!productId,
    });
}

/**
 * Get product categories
 */
export function useCategories() {
    return useQuery({
        queryKey: productKeys.categories(),
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
    });
}

/**
 * Infinite products (for infinite scroll)
 */
export function useInfiniteProducts(params = {}) {
    const { limit = 12, search = '', category = '', sort = 'newest' } = params;

    return useInfiniteQuery({
        queryKey: productKeys.list({ limit, search, category, sort }),
        queryFn: ({ pageParam = 1 }) => 
            productService.getProducts({ page: pageParam, limit, search, category, sort }),
        getNextPageParam: (lastPage) => {
            const { page, totalPage } = lastPage?.meta || {};
            return page < totalPage ? page + 1 : undefined;
        },
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        initialPageParam: 1,
    });
}