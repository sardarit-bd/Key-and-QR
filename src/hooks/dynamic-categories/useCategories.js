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
 * Get product categories
 */
export function useCategories() {
    return useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: () => productService.getCategories(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        retry: 2,
        // Fallback for when API fails
        placeholderData: {
            data: [
                { id: 'motivation', name: 'Motivation' },
                { id: 'love', name: 'Love' },
                { id: 'faith', name: 'Faith' },
                { id: 'hope', name: 'Hope' },
                { id: 'success', name: 'Success' },
            ]
        }
    });
}