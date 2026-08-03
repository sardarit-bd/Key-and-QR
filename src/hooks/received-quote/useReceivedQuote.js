import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import receivedQuoteService from '@/services/received-quote/receivedQuote.service';
import { DASHBOARD_KEYS } from '@/hooks/dashboard/useDashboardOverview';

export const receivedQuoteKeys = {
  all: ['received-quotes'],
  latest: () => [...receivedQuoteKeys.all, 'latest'],
  history: () => [...receivedQuoteKeys.all, 'history'],
};

/**
 * Receive a quote from the dashboard quote engine.
 * POST /received-quotes/receive { categorySlug }
 * Invalidates the dashboard overview so streak/usage/statistics stay fresh.
 */
export function useReceiveQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categorySlug) => receivedQuoteService.receive(categorySlug),
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success('New inspiration received ✨');
      } else if (result.message) {
        toast.error(result.message);
      }
      // Refresh dashboard data (streak, usage, recent quotes, statistics)
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.overview });
      queryClient.invalidateQueries({ queryKey: receivedQuoteKeys.all });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to receive quote');
    },
  });
}

/**
 * Get the latest received quote.
 * GET /received-quotes/latest
 */
export function useLatestReceivedQuote(enabled = true) {
  return useQuery({
    queryKey: receivedQuoteKeys.latest(),
    queryFn: () => receivedQuoteService.getLatest(),
    enabled,
    retry: 1,
  });
}
