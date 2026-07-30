'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Quote, PenSquare } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useAdminQuotes, useAdminQuoteActions } from '@/hooks/dashboard/useAdminQuotes';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { Search, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
} from '@/components/ui/dialog';

const ITEMS_PER_PAGE = 10;

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'love', label: 'Love' },
  { value: 'strength', label: 'Strength' },
  { value: 'healing', label: 'Healing' },
  { value: 'faith', label: 'Faith' },
  { value: 'gratitude', label: 'Gratitude' },
];

const ACTIVE_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getExcerpt(text, max = 80) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export default function AdminQuotesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [viewQuote, setViewQuote] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filters = { search: debouncedSearch, category, isActive, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminQuotes(filters);
  const { toggleQuoteActive, deleteQuote } = useAdminQuoteActions();

  const quotes = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleCategoryChange = useCallback((v) => { setCategory(v); setPage(1); }, []);
  const handleActiveChange = useCallback((v) => { setIsActive(v); setPage(1); }, []);

  const handleDelete = useCallback((quote) => {
    setDeleteId(quote._id);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteQuote.mutateAsync(deleteId);
    } catch {}
    setDeleteOpen(false);
    setDeleteId(null);
  }, [deleteId, deleteQuote]);

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
            <Quote size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load quotes</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Quote size={20} className="text-purple-400" />
              </span>
              All Quotes
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              Browse and manage the curated quote collection.
            </p>
          </div>
          <Link
            href="/new-dashboard/admin/quotes/create-visual"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <PenSquare size={16} />
            Create Visual Quote
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search quotes by text..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={isActive} onValueChange={handleActiveChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">{meta.total} quotes found</p>

      {/* No results */}
      {!isLoading && quotes.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <Quote size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No quotes found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {quotes.length > 0 && (
        <div className="hidden lg:block">
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="hidden lg:grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,80px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
              <span>Quote</span>
              <span>Author</span>
              <span>Category</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/50">
              {quotes.map((quote, i) => (
                <motion.div
                  key={quote._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,80px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{getExcerpt(quote.text)}</p>
                  </div>
                  <div className="text-xs text-foreground-secondary truncate">{quote.author || 'InspireTag'}</div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 capitalize">
                      {quote.category}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${quote.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {quote.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                  {quote.editorData && (
                    <Link
                      href={`/new-dashboard/admin/quotes/${quote._id}/edit-visual`}
                      className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title="Edit Visual"
                    >
                      <PenSquare size={12} className="text-emerald-400" />
                    </Link>
                  )}
                  <button
                      onClick={() => setViewQuote(quote)}
                      className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={13} className="text-primary" />
                    </button>
                    <button
                      onClick={() => toggleQuoteActive.mutate(quote._id)}
                      className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors cursor-pointer"
                      title={quote.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {quote.isActive ? <ToggleRight size={13} className="text-emerald-400" /> : <ToggleLeft size={13} className="text-foreground-tertiary" />}
                    </button>
                    <button
                      onClick={() => handleDelete(quote)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Mobile cards */}
      {quotes.length > 0 && (
        <div className="lg:hidden space-y-3">
          {quotes.map((quote) => (
            <Card key={quote._id} className="p-4">
              <p className="text-sm text-foreground mb-2">&ldquo;{getExcerpt(quote.text, 100)}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 capitalize">{quote.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${quote.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {quote.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setViewQuote(quote)} className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                    <Eye size={13} className="text-primary" />
                  </button>
                  <button onClick={() => handleDelete(quote)} className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={(o) => { if (!o) setViewQuote(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <div className="py-2 space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <p className="text-base text-foreground italic leading-relaxed">&ldquo;{viewQuote.text}&rdquo;</p>
                <p className="text-sm text-foreground-tertiary mt-2">— {viewQuote.author || 'InspireTag'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Category</p>
                  <p className="text-sm text-foreground capitalize mt-0.5">{viewQuote.category}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-medium mt-0.5 ${viewQuote.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {viewQuote.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Allow Reuse</p>
                  <p className="text-sm text-foreground mt-0.5">{viewQuote.allowReuse !== false ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Created</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDate(viewQuote.createdAt)}</p>
                </div>
              </div>
              {viewQuote.description && (
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Description</p>
                  <p className="text-sm text-foreground mt-0.5">{viewQuote.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} variant="delete" onConfirm={handleDeleteConfirm} isLoading={deleteQuote.isPending} userName="" />
    </div>
  );
}
