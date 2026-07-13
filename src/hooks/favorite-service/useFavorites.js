import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import favoriteService from "@/services/favorite-service/favorite.service";

// ============================================================
// QUERY KEYS
// ============================================================

export const favoriteKeys = {
    all: ['favorites'],
    lists: () => [...favoriteKeys.all, 'list'],
    list: (filters) => [...favoriteKeys.lists(), { ...filters }],
    details: () => [...favoriteKeys.all, 'detail'],
    detail: (id) => [...favoriteKeys.details(), id],
    stats: () => [...favoriteKeys.all, 'stats'],
    check: (productId, quoteId) => [...favoriteKeys.all, 'check', { productId, quoteId }],
};

// ============================================================
// FAVORITE HOOKS
// ============================================================

/**
 * Get all favorites
 */
export function useFavorites(params = {}) {
    const { page = 1, limit = 10 } = params;
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: favoriteKeys.list({ page, limit }),
        queryFn: () => favoriteService.getFavorites({ page, limit }),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        enabled: isAuthenticated(),
    });
}

/**
 * Check if item is favorite
 */
export function useFavoriteStatus(productId, quoteId) {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: favoriteKeys.check(productId, quoteId),
        queryFn: () => favoriteService.checkFavorite(productId, quoteId),
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        enabled: isAuthenticated() && !!(productId || quoteId),
        initialData: { exists: false, favoriteId: null },
    });
}

/**
 * Add to favorites mutation
 */
export function useAddFavoriteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload) => favoriteService.addFavorite(payload),
        onSuccess: (data, variables) => {
            // Invalidate all favorite queries
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
            
            // Optimistic update
            const productId = variables.productId;
            if (productId) {
                queryClient.setQueryData(
                    favoriteKeys.check(productId, null),
                    { exists: true, favoriteId: data?.data?._id }
                );
            }
            
            toast.success("Added to favorites ❤️");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add favorite");
        },
    });
}

/**
 * Remove favorite mutation
 */
export function useRemoveFavoriteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (favoriteId) => favoriteService.removeFavorite(favoriteId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
            toast.success("Removed from favorites 💔");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to remove favorite");
        },
    });
}

/**
 * Toggle favorite mutation
 */
export function useToggleFavoriteMutation() {
    const queryClient = useQueryClient();
    const addFavorite = useAddFavoriteMutation();
    const removeFavorite = useRemoveFavoriteMutation();

    const toggleFavorite = async ({ productId, quoteId, isFavorite, favoriteId }) => {
        if (isFavorite && favoriteId) {
            return removeFavorite.mutateAsync(favoriteId);
        } else {
            return addFavorite.mutateAsync({ productId, quoteId });
        }
    };

    return useMutation({
        mutationFn: toggleFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
        },
    });
}

/**
 * Get favorite stats
 */
export function useFavoriteStats() {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: favoriteKeys.stats(),
        queryFn: () => favoriteService.getFavoriteStats(),
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        enabled: isAuthenticated(),
    });
}