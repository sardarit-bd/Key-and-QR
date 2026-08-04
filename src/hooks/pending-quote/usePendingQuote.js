import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import pendingQuoteService from '@/services/pending-quote/pendingQuote.service';

export const pendingQuoteKeys = {
  all: ['pending-quotes'],
  submissions: () => [...pendingQuoteKeys.all, 'submissions'],
  submissionList: (filters) => [...pendingQuoteKeys.submissions(), { ...filters }],
};

/**
 * Get the user's quote submission history.
 * GET /pending-quotes/my-quotes — backend-paginated + filterable.
 */
export function useSubmissionHistory(params = {}) {
  const { page = 1, limit = 10, search = '', category = 'all', status = 'all', sortBy = 'newest' } = params;
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: pendingQuoteKeys.submissionList({ page, limit, search, category, status, sortBy }),
    queryFn: () =>
      pendingQuoteService.getMySubmissions({ page, limit, search, category, status, sortBy }),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    enabled: isAuthenticated(),
    select: (result) => ({
      data: result.data || [],
      meta: result.meta || { page: 1, limit, total: 0, totalPage: 0 },
    }),
  });
}

/**
 * Submit a quote for review.
 * POST /pending-quotes/submit
 * Invalidates the submission history on success.
 */
export function useSubmitQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => pendingQuoteService.submitQuote(payload),
    onSuccess: (result) => {
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit quote');
      }
      queryClient.invalidateQueries({ queryKey: pendingQuoteKeys.submissions() });
    },
  });
}
