import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  fetchCategories, 
  fetchQuotes, 
  fetchStats, 
  toggleFavoriteApi, 
  deleteQuoteApi 
} from '@/services/user-dashboard/quotes/api';

export function useQuotesData(filters) {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => fetchQuotes(filters),
    keepPreviousData: true,
  });
}

export function useQuoteStats() {
  return useQuery({
    queryKey: ['quote-stats'],
    queryFn: fetchStats,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['quote-categories'],
    queryFn: fetchCategories,
  });
}

export function useFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavoriteApi,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['quotes'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['quotes'] });

      // Optimistic update
      queryClient.setQueriesData({ queryKey: ['quotes'] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((quote) =>
            quote.id === id ? { ...quote, isFavorite: !quote.isFavorite } : quote
          ),
        };
      });

      return { previousQueries };
    },
    onError: (err, id, context) => {
      context.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to update favorite status. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
    },
  });
}

export function useDeleteQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuoteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quote-stats'] });
      toast.success("Quote deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete quote.");
    }
  });
}