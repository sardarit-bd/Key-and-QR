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
 * Returns the received quote payload. Invalidates the dashboard overview
 * so streak/usage/statistics stay fresh.
 *
 * NOTE: no toast on success — the client flow uses a loading → reveal
 * animation instead of a toast.
 */
export function useReceiveQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categorySlug) => {
      const result = await receivedQuoteService.receive(categorySlug);
      if (!result.success) {
        throw new Error(result.message || 'Failed to receive quote');
      }
      return result.data;
    },
    onSuccess: () => {
      // Refresh dashboard data (streak, usage, recent quotes, statistics)
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.overview });
      queryClient.invalidateQueries({ queryKey: receivedQuoteKeys.all });
    },
    onError: (error) => {
      const msg = error?.message || 'Failed to receive quote';
      if (msg.includes('No available quotes')) {
        toast.error('No inspiration is available in this category yet.');
      } else {
        toast.error(msg);
      }
    },
  });
}

/**
 * Read a received quote again.
 * GET /received-quotes/:id/read
 * Side-effect free: does NOT increase streak, does NOT consume daily usage.
 * Returns the full quote.
 */
export function useReadAgainMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (receivedQuoteId) => {
      const result = await receivedQuoteService.readAgain(receivedQuoteId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to load quote');
      }
      return result.data;
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to load quote');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: receivedQuoteKeys.all });
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
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Get received quote history (paginated).
 * GET /received-quotes/history
 */
export function useReceivedQuoteHistory(params = {}) {
  return useQuery({
    queryKey: receivedQuoteKeys.history(),
    queryFn: () => receivedQuoteService.getHistory(params),
    retry: 1,
  });
}
