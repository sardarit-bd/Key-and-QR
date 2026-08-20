import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import pendingQuoteService from '@/services/pending-quote/pendingQuote.service';

export const pendingQuoteKeys = {
  all: ['pending-quotes'],
  submissions: () => [...pendingQuoteKeys.all, 'submissions'],
  submissionList: (filters) => [...pendingQuoteKeys.submissions(), { ...filters }],
  status: () => [...pendingQuoteKeys.all, 'status'],
};

/**
 * Get the user's current submission eligibility (cooldown state).
 * GET /pending-quotes/status — the backend is the source of truth.
 */
export function useSubmissionStatus(enabled = true) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: pendingQuoteKeys.status(),
    queryFn: () => pendingQuoteService.getSubmissionStatus(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    enabled: enabled && isAuthenticated(),
    select: (result) => ({
      canSubmit: result.data?.canSubmit ?? true,
      plan: result.data?.plan || 'free',
      cooldownDays: result.data?.cooldownDays ?? 7,
      cooldownEndsAt: result.data?.cooldownEndsAt || null,
      lastSubmittedAt: result.data?.lastSubmittedAt || null,
      remainingMs: result.data?.remainingMs || 0,
    }),
  });
}

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
 *
 * On success the backend returns the computed cooldown state; we write it
 * into the status cache SYNCHRONOUSLY so `canSubmit` flips to false
 * immediately (no stale-UI window where the form is usable), then invalidate
 * both the history and the status to reconcile with the server.
 */
export function useSubmitQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => pendingQuoteService.submitQuote(payload),
    onSuccess: (result) => {
      if (!result.success) {
        // Surface the machine-readable cooldown error (SUBMISSION_COOLDOWN_ACTIVE)
        // with the next-allowed timestamp so the UI can start a countdown.
        const error = new Error(result.message || 'Failed to submit quote');
        error.code = result.error?.code;
        error.nextAllowedAt = result.error?.nextAllowedAt;
        error.remainingDays = result.error?.remainingDays;
        throw error;
      }

      // Optimistic synchronous cache write — the backend returned the exact
      // cooldown state for the just-created submission. Written in the same
      // envelope shape the status query's `select` expects ({ data: {...} }).
      const cooldown = result.data?.cooldown;
      if (cooldown) {
        queryClient.setQueryData(pendingQuoteKeys.status(), {
          success: true,
          data: {
            canSubmit: cooldown.canSubmit !== false,
            plan: cooldown.plan || 'free',
            cooldownDays: cooldown.plan === 'subscriber' ? 1 : 7,
            cooldownEndsAt: cooldown.cooldownEndsAt || null,
            lastSubmittedAt: cooldown.lastSubmittedAt || null,
            remainingMs: cooldown.cooldownEndsAt
              ? Math.max(new Date(cooldown.cooldownEndsAt).getTime() - Date.now(), 0)
              : 0,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: pendingQuoteKeys.submissions() });
      queryClient.invalidateQueries({ queryKey: pendingQuoteKeys.status() });
    },
  });
}
