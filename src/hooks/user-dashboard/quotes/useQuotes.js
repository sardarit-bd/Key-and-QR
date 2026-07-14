import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchQuote,
  checkFavoriteApi,
  addFavoriteApi,
  removeFavoriteApi,
} from "@/services/user-dashboard/quotes/api";

// Fetch random quote
export function useQuote(category = "random") {
  return useQuery({
    queryKey: ["quote", category],
    queryFn: () => fetchQuote(category),
    staleTime: 1000 * 60, // 1 minute
  });
}

// Check favorite status
export function useFavoriteStatus(quoteId, enabled = true) {
  return useQuery({
    queryKey: ["favorite-status", quoteId],
    queryFn: () => checkFavoriteApi(quoteId),
    enabled: enabled && !!quoteId,
  });
}

// Add to favorites
export function useAddFavoriteMutation() {
  return useMutation({
    mutationFn: addFavoriteApi,
    onSuccess: () => {
      toast.success("Saved to favorites ❤️");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to save favorite."
      );
    },
  });
}

// Remove from favorites
export function useRemoveFavoriteMutation() {
  return useMutation({
    mutationFn: removeFavoriteApi,
    onSuccess: () => {
      toast.success("Removed from favorites 💔");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to remove favorite."
      );
    },
  });
}