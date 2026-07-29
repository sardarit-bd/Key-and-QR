import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminQuotesService } from '@/services/dashboard-service/admin-quotes.service';

export const ADMIN_QUOTES_KEYS = {
  all: ['admin-quotes'],
  list: (filters) => ['admin-quotes', 'list', filters],
  pending: (filters) => ['admin-quotes', 'pending', filters],
};

/** Fetch main quotes list */
export function useAdminQuotes(filters = {}) {
  return useQuery({
    queryKey: ADMIN_QUOTES_KEYS.list(filters),
    queryFn: () => adminQuotesService.getQuotes(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });
}

/** Fetch pending quotes */
export function useAdminPendingQuotes(filters = {}) {
  return useQuery({
    queryKey: ADMIN_QUOTES_KEYS.pending(filters),
    queryFn: () => adminQuotesService.getPendingQuotes(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });
}

/** Admin actions: approve, reject, toggle active, delete */
export function useAdminQuoteActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_QUOTES_KEYS.all });
  };

  const approveQuote = useMutation({
    mutationFn: ({ id, adminNote }) => adminQuotesService.approveQuote(id, adminNote),
    onSuccess: () => { toast.success('Quote approved successfully'); invalidate(); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to approve quote'),
  });

  const rejectQuote = useMutation({
    mutationFn: ({ id, adminNote }) => adminQuotesService.rejectQuote(id, adminNote),
    onSuccess: () => { toast.success('Quote rejected'); invalidate(); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to reject quote'),
  });

  const deletePendingQuote = useMutation({
    mutationFn: (id) => adminQuotesService.deletePendingQuote(id),
    onSuccess: () => { toast.success('Pending quote deleted'); invalidate(); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  });

  const toggleQuoteActive = useMutation({
    mutationFn: (id) => adminQuotesService.toggleQuoteActive(id),
    onSuccess: () => { toast.success('Quote status toggled'); invalidate(); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to toggle'),
  });

  const deleteQuote = useMutation({
    mutationFn: (id) => adminQuotesService.deleteQuote(id),
    onSuccess: () => { toast.success('Quote deleted'); invalidate(); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  });

  return { approveQuote, rejectQuote, deletePendingQuote, toggleQuoteActive, deleteQuote };
}
