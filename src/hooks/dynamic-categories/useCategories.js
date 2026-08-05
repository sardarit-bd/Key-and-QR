import productService from "@/services/product-service/product.service";
import { useQuery } from "@tanstack/react-query";

// ============================================================
// QUERY KEYS
// ============================================================

export const categoryKeys = {
    all: ['categories'],
    lists: () => [...categoryKeys.all, 'list'],
};

/**
 * Get product categories (from GET /products/categories).
 * NOTE: this is the PRODUCT category list — not the quote category list.
 * Quote categories come from useQuoteCategories() (GET /categories).
 */
export function useCategories() {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
    });
}
