'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useAdminPendingQuotes, useAdminQuoteActions } from '@/hooks/dashboard/useAdminQuotes';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/public/quote/category';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getExcerpt(text, max = 80) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export default function AdminPendingQuotesPage({ defaultStatus = '', title = 'Pending Quotes', description = 'Review, approve, or reject user-submitted quotes.' }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(defaultStatus || 'all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [viewQuote, setViewQuote] = useState(null);
  const [reviewQuote, setReviewQuote] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filters = { search: debouncedSearch, status, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminPendingQuotes(filters);
  const { approveQuote, rejectQuote, deletePendingQuote } = useAdminQuoteActions();

  const quotes = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleStatusChange = useCallback((v) => { setStatus(v); setPage(1); }, []);

  const handleApprove = useCallback(async () => {
    if (!reviewQuote) return;
    setReviewLoading(true);
    try {
      await approveQuote.mutateAsync({ id: reviewQuote._id, adminNote });
      setReviewQuote(null);
      setAdminNote('');
    } catch { }
    setReviewLoading(false);
  }, [reviewQuote, adminNote, approveQuote]);

  const handleReject = useCallback(async () => {
    if (!reviewQuote) return;
    setReviewLoading(true);
    try {
      await rejectQuote.mutateAsync({ id: reviewQuote._id, adminNote });
      setReviewQuote(null);
      setAdminNote('');
    } catch { }
    setReviewLoading(false);
  }, [reviewQuote, adminNote, rejectQuote]);

  const handleDelete = useCallback((quote) => {
    setDeleteId(quote._id);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deletePendingQuote.mutateAsync(deleteId);
    } catch { }
    setDeleteOpen(false);
    setDeleteId(null);
  }, [deleteId, deletePendingQuote]);

  if (isLoading && quotes.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError && quotes.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Clock size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load pending quotes</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Clock size={20} className="text-amber-400" />
          </span>
          {title}
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          {description}
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by text or user..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={`pending-status-${o.value}`} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">{meta.total} quotes found</p>

      {!isLoading && quotes.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Clock size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No pending quotes</p>
            <p className="text-xs text-foreground-tertiary">All user-submitted quotes have been reviewed.</p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {quotes.length > 0 && (
        <>
          <div className="hidden lg:block">
            <Card className="p-4 sm:p-5 md:p-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">
                      <th className="w-[42%] text-left px-3 pb-3 font-medium">Quote</th>
                      <th className="w-[20%] text-left px-3 pb-3 font-medium">Submitted By</th>
                      <th className="w-[14%] text-left px-3 pb-3 font-medium">Category</th>
                      <th className="w-[10%] text-left px-3 pb-3 font-medium">Status</th>
                      <th className="w-[14%] text-right px-3 pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {quotes.map((quote, i) => {
                      const statusStyle = STATUS_STYLES[quote.status] || STATUS_STYLES.pendinyg;
                      return (
                        <tr
                          key={quote._id || `pending-quote-${i}`}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="w-[42%] max-w-xs md:max-w-md break-words px-3 py-3 align-middle">
                            <p className="text-sm text-foreground line-clamp-2" title={quote.text}>
                              &ldquo;{quote.text}&rdquo;
                            </p>
                          </td>
                          <td className="w-[20%] px-3 py-3 align-middle text-xs text-foreground-secondary truncate font-medium">
                            {quote.user?.name || quote.user?.email || 'Unknown'}
                          </td>
                          <td className="w-[14%] px-3 py-3 align-middle">
                            <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center ${getCategoryBadgeClass(quote.category)}`}>
                              {getCategoryLabel(quote.category)}
                            </span>
                          </td>
                          <td className="w-[10%] px-3 py-3 align-middle">
                            <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border capitalize inline-flex items-center ${statusStyle}`}>
                              {quote.status}
                            </span>
                          </td>
                          <td className="w-[14%] px-3 py-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => setViewQuote(quote)}
                                className="h-8 w-8 min-w-[32px] rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70 border border-transparent hover:border-neutral-700/50 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              {quote.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => { setReviewQuote(quote); setAdminNote(''); }}
                                    className="h-8 w-8 min-w-[32px] rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                                    title="Approve"
                                  >
                                    <CheckCircle size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { setReviewQuote(quote); setAdminNote(''); }}
                                    className="h-8 w-8 min-w-[32px] rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                                    title="Reject"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="h-8 w-8 min-w-[32px] shrink-0" aria-hidden="true" />
                                  <div className="h-8 w-8 min-w-[32px] shrink-0" aria-hidden="true" />
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDelete(quote)}
                                className="h-8 w-8 min-w-[32px] rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {quotes.map((quote) => {
              const statusStyle = STATUS_STYLES[quote.status] || STATUS_STYLES.pending;
              return (
                <Card key={quote._id} className="p-4 space-y-3">
                  <p className="text-sm text-foreground font-medium italic">&ldquo;{getExcerpt(quote.text, 100)}&rdquo;</p>
                  <p className="text-xs text-foreground-tertiary">by {quote.user?.name || 'Unknown'}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getCategoryBadgeClass(quote.category)}`}>{getCategoryLabel(quote.category)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusStyle}`}>{quote.status}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewQuote(quote)}
                        className="h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/70 border border-transparent hover:border-neutral-700/50 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      {quote.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setReviewQuote(quote); setAdminNote(''); }}
                            className="h-8 w-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setReviewQuote(quote); setAdminNote(''); }}
                            className="h-8 w-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(quote)}
                        className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={(o) => { if (!o) setViewQuote(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Quote Details</DialogTitle></DialogHeader>
          {viewQuote && (
            <div className="py-2 space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="text-base text-foreground italic leading-relaxed">&ldquo;{viewQuote.text}&rdquo;</p>
                <p className="text-sm text-foreground-tertiary mt-2">— {viewQuote.author || 'InspireTag'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Submitted By</p>
                  <p className="text-sm text-foreground mt-0.5">{viewQuote.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Category</p>
                  <p className="text-sm text-foreground capitalize mt-0.5">{getCategoryLabel(viewQuote.category)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-medium capitalize mt-0.5 ${viewQuote.status === 'approved' ? 'text-emerald-400' : viewQuote.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>{viewQuote.status}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Created</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDate(viewQuote.createdAt)}</p>
                </div>
              </div>
              {viewQuote.adminNote && (
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Admin Note</p>
                  <p className="text-sm text-foreground mt-0.5">{viewQuote.adminNote}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Review Dialog */}
      <Dialog open={!!reviewQuote} onOpenChange={(o) => { if (!o) { setReviewQuote(null); setAdminNote(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Review Quote</DialogTitle></DialogHeader>
          {reviewQuote && (
            <div className="py-2 space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="text-sm text-foreground italic">&ldquo;{reviewQuote.text}&rdquo;</p>
                <p className="text-xs text-foreground-tertiary mt-1">— {reviewQuote.author || 'Anonymous'} · {reviewQuote.category}</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground-secondary">Admin Note (optional)</label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note..." rows={2} />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setReviewQuote(null); setAdminNote(''); }}
                  disabled={reviewLoading}
                  className="h-10 px-4 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/80 font-medium transition-all cursor-pointer select-none"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={reviewLoading}
                  className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer select-none"
                >
                  {reviewLoading ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={reviewLoading}
                  className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer select-none"
                >
                  {reviewLoading ? 'Processing...' : 'Approve'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} variant="delete" onConfirm={handleDeleteConfirm} isLoading={deletePendingQuote.isPending} userName="" />
    </div>
  );
}
