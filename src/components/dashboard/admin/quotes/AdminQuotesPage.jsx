'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Quote,
  PenSquare,
  Plus,
  Search,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  MoreVertical,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useAdminQuotes, useAdminQuoteActions } from '@/hooks/dashboard/useAdminQuotes';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/category';
import { resolveBackgroundImage } from '@/components/category/categoryImages';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 12;

const ACTIVE_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getExcerpt(text, max = 110) {
  if (!text) return '—';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function getQuoteCardData(quote) {
  const desktopElements =
    quote.editorData?.desktop?.elements ||
    quote.editorData?.elements ||
    [];

  // 1. Find visual image from editor elements, visual background, or legacy image
  const imageEl = desktopElements.find(
    (e) => e.type === 'image' && e.imageData?.source?.url
  );
  const visualBg = quote.editorData?.desktop?.background;
  const visualBgImg = visualBg?.type === 'image' && visualBg.source?.url;

  const customImg =
    imageEl?.imageData?.source?.url || visualBgImg || quote.image?.url;
  const bgUrl = resolveBackgroundImage(quote.category, customImg);

  let bgStyle = {};
  if (!customImg && visualBg?.type === 'solid' && visualBg.value) {
    bgStyle = { backgroundColor: visualBg.value };
  } else if (!customImg && visualBg?.type === 'gradient' && visualBg.value) {
    bgStyle = { background: visualBg.value };
  } else {
    bgStyle = {
      backgroundImage: `url(${bgUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  // 2. Find visual quote text and canonical author
  const textEl = desktopElements.find((e) => e.type === 'text');

  const quoteText = textEl?.textData?.content?.trim() || quote.text || '';
  const authorName = (quote.author || '').replace(/^—\s*/, '').trim();

  return {
    bgStyle,
    bgUrl,
    quoteText,
    authorName,
  };
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

  const { data: quoteCategories = [] } = useQuoteCategories();

  const filters = { search: debouncedSearch, category, isActive, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminQuotes(filters);
  const { toggleQuoteActive, deleteQuote } = useAdminQuoteActions();

  const quotes = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const categoryOptions = useMemo(() => {
    const set = new Map();
    set.set('all', { value: 'all', label: 'All Categories' });

    quoteCategories.forEach((cat) => {
      set.set(cat.slug, { value: cat.slug, label: cat.name || getCategoryLabel(cat.slug) });
    });

    quotes.forEach((q) => {
      if (q.category && !set.has(q.category)) {
        set.set(q.category, { value: q.category, label: getCategoryLabel(q.category) });
      }
    });

    return Array.from(set.values());
  }, [quoteCategories, quotes]);

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

  const handleDuplicate = async (quote) => {
    const toastId = toast.loading('Duplicating quote...');
    try {
      await api.post('/quotes', {
        text: `${quote.text} (Copy)`,
        author: quote.author || 'InspireTag',
        category: quote.category || 'love',
        editorData: quote.editorData || null,
      });
      toast.success('Quote duplicated', { id: toastId });
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to duplicate quote', { id: toastId });
    }
  };

  const openPreview = (quoteId) => {
    window.open(`/admin/quotes/preview?id=${quoteId}&mode=desktop`, '_blank');
  };

  if (isLoading && quotes.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-10 bg-card rounded-xl border border-border w-full animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-card rounded-2xl border border-border animate-pulse p-4 space-y-3">
              <div className="h-44 bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError && quotes.length === 0) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Quote size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-semibold">Failed to load quotes</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header with Single Primary Create Quote Entry Point */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Quote size={20} />
              </span>
              All Quotes
            </h1>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-1.5 ml-[52px]">
              Visual quote catalog and curated inspirations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/new-dashboard/admin/quotes/create-visual"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all text-xs sm:text-sm shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Quote</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search quotes by text or author..."
            className="pl-9 h-10 text-xs rounded-xl"
          />
        </div>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-44 h-10 text-xs rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={isActive} onValueChange={handleActiveChange}>
          <SelectTrigger className="w-full sm:w-36 h-10 text-xs rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVE_FILTERS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-xs text-foreground-tertiary">
        <span>{meta.total} quotes available</span>
      </div>

      {/* Empty State */}
      {!isLoading && quotes.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3 text-foreground-tertiary">
            <Quote size={28} />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No quotes found</p>
          <p className="text-xs text-foreground-tertiary mb-5">Try adjusting your search filters or create a new quote.</p>
          <Link
            href="/new-dashboard/admin/quotes/create-visual"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-xs"
          >
            <Plus size={14} />
            <span>Create First Quote</span>
          </Link>
        </div>
      )}

      {/* Responsive Visual Quote Card Grid */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {quotes.map((quote, i) => {
            const { bgStyle, quoteText, authorName } = getQuoteCardData(quote);

            return (
              <motion.div
                key={quote._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * Math.min(i, 12) }}
                className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Visual Thumbnail Preview Area */}
                <div
                  style={bgStyle}
                  className="relative aspect-[16/10] w-full flex flex-col justify-between p-4 overflow-hidden select-none"
                >
                  {/* Subtle Dark Gradient Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none" />

                  {/* Top Badges (Category & Status) */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize backdrop-blur-md ${getCategoryBadgeClass(quote.category)}`}>
                      {getCategoryLabel(quote.category)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                        quote.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {quote.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Centered Quote Artwork Preview Text */}
                  <div className="relative z-10 my-auto text-center px-2">
                    <p className="text-xs sm:text-sm font-serif italic font-medium text-white line-clamp-3 leading-snug drop-shadow-sm">
                      &ldquo;{quoteText}&rdquo;
                    </p>
                    {authorName && (
                      <p className="text-[10px] text-white/80 font-sans tracking-wide mt-1.5 drop-shadow-xs">
                        — {authorName}
                      </p>
                    )}
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-xs flex items-center justify-center gap-2 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={() => openPreview(quote._id)}
                      className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>
                    <Link
                      href={`/new-dashboard/admin/quotes/${quote._id}/edit-visual`}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PenSquare size={13} />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>

                {/* Card Body & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                      &ldquo;{getExcerpt(quoteText, 90)}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-foreground-tertiary mt-2">
                      <span className="font-medium text-foreground-secondary truncate max-w-[130px]">
                        {authorName ? `— ${authorName}` : '—'}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar size={11} />
                        <span>{formatDate(quote.createdAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <Link
                      href={`/new-dashboard/admin/quotes/${quote._id}/edit-visual`}
                      className="flex-1 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                      <PenSquare size={12} />
                      <span>Edit Visual</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => openPreview(quote._id)}
                      className="h-8 px-2.5 rounded-lg border border-border hover:bg-muted text-foreground-secondary hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                      title="Open Full Preview"
                    >
                      <Eye size={13} />
                    </button>

                    {/* More Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-8 w-8 rounded-lg border border-border hover:bg-muted text-foreground-tertiary hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                          title="More actions"
                        >
                          <MoreVertical size={13} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem onClick={() => setViewQuote(quote)} className="cursor-pointer">
                          <Sparkles size={13} className="mr-2 text-primary" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(quote)} className="cursor-pointer">
                          <Copy size={13} className="mr-2 text-foreground-secondary" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleQuoteActive.mutate(quote._id)} className="cursor-pointer">
                          {quote.isActive ? (
                            <>
                              <ToggleLeft size={13} className="mr-2 text-amber-500" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <ToggleRight size={13} className="mr-2 text-emerald-500" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(quote)} className="text-destructive cursor-pointer">
                          <Trash2 size={13} className="mr-2" />
                          <span>Delete Quote</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-4" />
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={(o) => { if (!o) setViewQuote(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <div className="py-2 space-y-4">
              <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                <p className="text-base text-foreground italic font-serif leading-relaxed">&ldquo;{viewQuote.text}&rdquo;</p>
                <p className="text-xs text-foreground-tertiary mt-2">— {viewQuote.author || 'InspireTag'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Category</p>
                  <p className="text-sm text-foreground capitalize mt-0.5">{getCategoryLabel(viewQuote.category)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Status</p>
                  <p className={`text-sm font-semibold mt-0.5 ${viewQuote.isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {viewQuote.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Created</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDate(viewQuote.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider">Format</p>
                  <p className="text-sm text-foreground mt-0.5">{viewQuote.editorData ? 'Visual Design 2.0' : 'Standard'}</p>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openPreview(viewQuote._id)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
                >
                  Open Preview
                </button>
                <Link
                  href={`/new-dashboard/admin/quotes/${viewQuote._id}/edit-visual`}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-colors"
                >
                  Edit in Visual Editor
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        variant="delete"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteQuote.isPending}
        userName=""
      />
    </div>
  );
}
