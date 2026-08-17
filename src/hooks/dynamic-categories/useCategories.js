import productService from "@/services/product-service/product.service";
import { useQuery } from "@tanstack/react-query";

// ============================================================
// QUERY KEYS
// ============================================================

export const productCategoryKeys = {
    all: ['product-categories'],
    lists: () => [...productCategoryKeys.all, 'list'],
};

// Backwards compatibility alias
export const categoryKeys = productCategoryKeys;

/**
 * Get product categories (from GET /products/categories).
 * NOTE: this is the PRODUCT category list — not the quote category list.
 * Quote categories come from useQuoteCategories() (GET /categories).
 */
export function useCategories() {
    return useQuery({
        queryKey: productCategoryKeys.lists(),
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
    });
}

