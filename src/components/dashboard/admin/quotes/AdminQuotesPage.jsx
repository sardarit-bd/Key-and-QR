'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Quote as QuoteIcon,
  Plus,
  Search,
  Eye,
  PenSquare,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  MoreVertical,
  Calendar,
  Sparkles,
  Link2,
  QrCode,
  Users,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useAdminQuotes, useAdminQuoteActions } from '@/hooks/dashboard/useAdminQuotes';
import { useQuoteAssignments } from '@/hooks/dashboard/useAdminQuoteAssignment';
import ConfirmDialog from '../shared/ConfirmDialog';
import AssignQuoteModal from './AssignQuoteModal';
import QuoteDetailsModal from './QuoteDetailsModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuoteCategories } from '@/hooks/category/useQuoteCategories';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/public/quote/category';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ACTIVE_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const ASSIGNMENT_FILTERS = [
  { value: 'all', label: 'All Assignments' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'tags', label: 'Assigned to Tags' },
  { value: 'users', label: 'Assigned to Customers' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isValidImageUrl(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes('res.cloudinary.com/demo/') &&
    !trimmed.startsWith('/images/quote-bg/')
  );
}

function getQuoteCardData(quote) {
  const desktopElements =
    quote.editorData?.desktop?.elements ||
    quote.editorData?.elements ||
    [];
  const mobileElements = quote.editorData?.mobile?.elements || [];

  const desktopImageEl = desktopElements.find(
    (e) => e.type === 'image' && isValidImageUrl(e.imageData?.source?.url)
  );
  const mobileImageEl = mobileElements.find(
    (e) => e.type === 'image' && isValidImageUrl(e.imageData?.source?.url)
  );
  const visualBg = quote.editorData?.desktop?.background || quote.editorData?.mobile?.background;
  const visualBgImg =
    visualBg?.type === 'image' && isValidImageUrl(visualBg.source?.url)
      ? visualBg.source.url
      : null;
  const renderedThumbnail =
    (isValidImageUrl(quote.renderedImages?.desktop?.url) && quote.renderedImages.desktop.url) ||
    (isValidImageUrl(quote.renderedImages?.mobile?.url) && quote.renderedImages.mobile.url) ||
    null;

  const legacyImg = isValidImageUrl(quote.image?.url) ? quote.image.url : null;

  const rawCustomImg =
    renderedThumbnail ||
    desktopImageEl?.imageData?.source?.url ||
    mobileImageEl?.imageData?.source?.url ||
    visualBgImg ||
    legacyImg;

  const customImg = isValidImageUrl(rawCustomImg) ? rawCustomImg : null;

  let bgStyle = {};
  if (customImg) {
    bgStyle = {
      backgroundImage: `url(${customImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (visualBg?.type === 'solid' && visualBg.value) {
    bgStyle = { backgroundColor: visualBg.value };
  } else if (visualBg?.type === 'gradient' && visualBg.value) {
    bgStyle = { background: visualBg.value };
  } else {
    bgStyle = {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
    };
  }

  const textEl =
    desktopElements.find((e) => e.type === 'text') ||
    mobileElements.find((e) => e.type === 'text');

  const rawText = textEl?.textData?.content?.trim() || quote.text?.trim() || '';
  const isImageOnly = !rawText || rawText.toLowerCase() === 'untitled quote';
  const displayTitle = isImageOnly ? 'Image Quote' : rawText;
  const authorName = (quote.author || '').replace(/^—\s*/, '').trim();
  const hasCustomArtwork = Boolean(customImg);

  return {
    bgStyle,
    bgUrl: customImg,
    quoteText: rawText,
    displayTitle,
    isImageOnly,
    hasCustomArtwork,
    authorName,
  };
}

function generatePageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function AdminQuotesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isActive, setIsActive] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  // Modals state
  const [selectedQuoteForAssign, setSelectedQuoteForAssign] = useState(null);
  const [selectedQuoteForView, setSelectedQuoteForView] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Queries
  const { data: quoteCategories = [] } = useQuoteCategories();

  const filters = { search: debouncedSearch, category, isActive, page, limit };
  const { data, isLoading, isError, error, refetch } = useAdminQuotes(filters);
  const { toggleQuoteActive, deleteQuote } = useAdminQuoteActions();

  // Active Assignments Query (Global Source of Truth)
  const {
    data: assignmentsData,
    refetch: refetchAssignments,
  } = useQuoteAssignments({ limit: 1000, isActive: true });

  const rawQuotes = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0, limit: 10 };
  const assignments = assignmentsData?.data || [];

  // Lookup map: quoteId -> { tagCount, userCount, totalCount }
  const quoteAssignmentsSummaryMap = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (a.isActive === false) return;
      const qId = a.quote?._id?.toString() || (typeof a.quote === 'string' ? a.quote : a.quote?.toString?.());
      if (!qId) return;

      if (!map.has(qId)) {
        map.set(qId, { tagCount: 0, userCount: 0, totalCount: 0 });
      }
      const entry = map.get(qId);
      entry.totalCount += 1;
      if (a.assignmentType === 'tag') {
        entry.tagCount += 1;
      } else if (a.assignmentType === 'user') {
        entry.userCount += 1;
      }
    });
    return map;
  }, [assignments]);

  // Client-side assignment filter
  const quotes = useMemo(() => {
    if (assignmentFilter === 'all') return rawQuotes;

    return rawQuotes.filter((quote) => {
      const qId = (quote._id || quote.id)?.toString();
      const summary = quoteAssignmentsSummaryMap.get(qId) || { tagCount: 0, userCount: 0, totalCount: 0 };

      if (assignmentFilter === 'assigned') return summary.totalCount > 0;
      if (assignmentFilter === 'unassigned') return summary.totalCount === 0;
      if (assignmentFilter === 'tags') return summary.tagCount > 0;
      if (assignmentFilter === 'users') return summary.userCount > 0;
      return true;
    });
  }, [rawQuotes, assignmentFilter, quoteAssignmentsSummaryMap]);

  // Categories Dropdown Options
  const categoryOptions = useMemo(() => {
    const set = new Map();
    set.set('all', { value: 'all', label: 'All Categories' });

    if (Array.isArray(quoteCategories)) {
      quoteCategories.forEach((cat) => {
        const val = cat.slug || cat._id || (cat.name ? String(cat.name).toLowerCase().replace(/\s+/g, '-').trim() : null);
        if (val) {
          set.set(val, { value: val, label: cat.name || getCategoryLabel(val) });
        }
      });
    }

    if (Array.isArray(rawQuotes)) {
      rawQuotes.forEach((q) => {
        if (q?.category && typeof q.category === 'string' && !set.has(q.category)) {
          set.set(q.category, { value: q.category, label: getCategoryLabel(q.category) });
        }
      });
    }

    return Array.from(set.values());
  }, [quoteCategories, rawQuotes]);

  // Pagination calculation
  const totalQuotes = meta?.total || rawQuotes.length;
  const totalPages = meta?.totalPage || Math.ceil(totalQuotes / limit) || 1;
  const startRange = totalQuotes === 0 ? 0 : (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, totalQuotes);
  const pageNumbers = useMemo(() => generatePageNumbers(page, totalPages), [page, totalPages]);

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleCategoryChange = useCallback((v) => { setCategory(v); setPage(1); }, []);
  const handleActiveChange = useCallback((v) => { setIsActive(v); setPage(1); }, []);
  const handleAssignmentFilterChange = useCallback((v) => { setAssignmentFilter(v); setPage(1); }, []);

  const handleDelete = useCallback((quote) => {
    setDeleteId(quote._id);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    try {
      await deleteQuote.mutateAsync(deleteId);
      refetchAssignments();
    } catch { }
    setDeleteOpen(false);
    setDeleteId(null);
  }, [deleteId, deleteQuote, refetchAssignments]);

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

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            All Quotes – Manage, Assign & Track Instantly
          </h1>
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Everything in one place. See, assign, and manage without leaving the page.
          </p>
        </div>

        <Link
          href="/dashboard/admin/quotes/create-visual"
          className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-medium text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-200 active:scale-95 shrink-0 select-none cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Quote</span>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary/70" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search quotes by text, author or category..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full h-9.5 text-xs sm:text-sm rounded-xl border-border bg-background">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-64">
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <Select value={isActive} onValueChange={handleActiveChange}>
              <SelectTrigger className="w-full h-9.5 text-xs sm:text-sm rounded-xl border-border bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ACTIVE_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Filter */}
          <div className="lg:col-span-2">
            <Select value={assignmentFilter} onValueChange={handleAssignmentFilterChange}>
              <SelectTrigger className="w-full h-9.5 text-xs sm:text-sm rounded-xl border-border bg-background">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ASSIGNMENT_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Quotes Management List */}
      <div className="space-y-4">
        {isLoading && quotes.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-40 bg-card rounded-2xl border border-border/80 p-4 sm:p-5 flex flex-col md:flex-row gap-5 animate-pulse"
              >
                <div className="w-full md:w-36 h-32 bg-muted rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
                <div className="w-full md:w-56 h-32 bg-muted rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center border border-dashed border-rose-500/30 rounded-2xl bg-card">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-rose-500" />
            <h3 className="text-base font-bold text-foreground">Failed to load quotes</h3>
            <p className="text-xs text-foreground-secondary mt-1 max-w-md mx-auto">
              {error?.message || 'Something went wrong while fetching quotes.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card shadow-2xs">
            <QuoteIcon className="w-10 h-10 mx-auto mb-3 text-foreground-secondary/40" />
            <h3 className="text-base font-bold text-foreground">No quotes found</h3>
            <p className="text-xs text-foreground-secondary mt-1 max-w-sm mx-auto">
              No quotes match your current filter criteria. Try adjusting your search or filters.
            </p>
            {(search || category !== 'all' || isActive !== 'all' || assignmentFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setIsActive('all');
                  setAssignmentFilter('all');
                  setPage(1);
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-muted text-foreground"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const qId = (quote._id || quote.id)?.toString();
              const cardData = getQuoteCardData(quote);
              const summary = quoteAssignmentsSummaryMap.get(qId) || {
                tagCount: 0,
                userCount: 0,
                totalCount: 0,
              };

              return (
                <div
                  key={qId}
                  className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                >
                  {/* LEFT: Artwork Thumbnail */}
                  <div
                    style={cardData.bgStyle}
                    className="w-full md:w-36 h-32 rounded-xl shrink-0 border border-border/60 relative overflow-hidden shadow-2xs flex items-center justify-center p-3 text-center group"
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="relative z-10 text-white">
                      <Sparkles className="w-5 h-5 mx-auto mb-1 opacity-80" />
                      <p className="text-xs font-semibold line-clamp-2 italic opacity-90">
                        &ldquo;{cardData.displayTitle}&rdquo;
                      </p>
                      {cardData.authorName && (
                        <p className="text-[11px] opacity-80 font-medium truncate mt-0.5">
                          — {cardData.authorName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CENTER: Quote Information */}
                  <div className="flex-1 min-w-0 space-y-2.5 w-full">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                        &ldquo;{cardData.quoteText || cardData.displayTitle}&rdquo;
                      </h3>
                      {cardData.authorName && (
                        <p className="text-xs sm:text-sm text-foreground-secondary font-medium mt-0.5">
                          — {cardData.authorName}
                        </p>
                      )}
                    </div>

                    {/* Meta Badges */}
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      {quote.category && (
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-md font-medium capitalize border ${getCategoryBadgeClass(
                            quote.category
                          )}`}
                        >
                          {getCategoryLabel(quote.category)}
                        </span>
                      )}

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${quote.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                      >
                        {quote.isActive !== false ? 'Active' : 'Inactive'}
                      </span>

                      <span className="text-xs text-foreground-secondary flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-foreground-secondary/70" />
                        <span>Created {formatDate(quote.createdAt)}</span>
                      </span>

                      {/* {quote._id && (
                        <span className="text-xs font-semibold text-foreground-secondary/80 bg-muted/60 px-2 py-0.5 rounded-md">
                          ID: {quote._id.slice(-6).toUpperCase()}
                        </span>
                      )} */}
                    </div>
                  </div>

                  {/* RIGHT: Assignment Summary Card & Actions */}
                  <div className="w-full md:w-72 shrink-0 flex flex-col gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border/70 md:pl-5">
                    {/* Assignment Summary Box */}
                    <div className="bg-muted/30 border border-border/70 rounded-xl p-3 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1">
                        <span>Assignment Summary</span>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-foreground">
                        <span className="flex items-center gap-1.5 text-foreground-secondary">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Tags</span>
                        </span>
                        <span className="font-bold">{summary.tagCount}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-foreground">
                        <span className="flex items-center gap-1.5 text-foreground-secondary">
                          <Users className="w-3.5 h-3.5" />
                          <span>Customers</span>
                        </span>
                        <span className="font-bold">{summary.userCount}</span>
                      </div>

                      <div className="border-t border-border/60 pt-1.5 mt-1.5 flex items-center justify-between text-xs sm:text-sm font-bold text-foreground">
                        <span>Total</span>
                        <span className="text-primary font-bold">{summary.totalCount}</span>
                      </div>
                    </div>

                    {/* Actions Bar - Single primary [ Assign ] button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteForAssign(quote)}
                        className="flex-1 px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold text-xs sm:text-sm shadow-2xs transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>

                      <Link
                        href={`/dashboard/admin/quotes/${quote._id}/edit-visual`}
                        className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-xs sm:text-sm transition-colors text-center cursor-pointer"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedQuoteForView(quote)}
                        className="px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-xs sm:text-sm transition-colors text-center cursor-pointer"
                      >
                        View
                      </button>

                      {/* Three Dot Dropdown - No Assign action, Duplicate is only here */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg">
                          {/* <DropdownMenuItem
                            onClick={() => setSelectedQuoteForView(quote)}
                            className="text-xs sm:text-sm cursor-pointer rounded-lg flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-foreground-secondary" />
                            <span>View Details</span>
                          </DropdownMenuItem> */}

                          <DropdownMenuItem
                            onClick={() => openPreview(quote._id)}
                            className="text-xs sm:text-sm cursor-pointer rounded-lg flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-foreground-secondary" />
                            <span>Open Preview</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDuplicate(quote)}
                            className="text-xs sm:text-sm cursor-pointer rounded-lg flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4 text-foreground-secondary" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => toggleQuoteActive.mutate(quote._id)}
                            className="text-xs sm:text-sm cursor-pointer rounded-lg flex items-center gap-2"
                          >
                            {quote.isActive !== false ? (
                              <>
                                <ToggleLeft className="w-4 h-4 text-amber-500" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleDelete(quote)}
                            className="
                                  flex items-center gap-2 rounded-lg
                                  text-xs sm:text-sm
                                  cursor-pointer

                                  !text-rose-600

                                  hover:!bg-rose-500/10
                                  hover:!text-rose-600

                                  focus:!bg-rose-500/10
                                  focus:!text-rose-600

                                  data-[highlighted]:!bg-rose-500/10
                                  data-[highlighted]:!text-rose-600
                                  data-[disabled]:!text-rose-600
                                  data-[disabled]:!opacity-100
                                "
                          >
                            <Trash2
                              className="h-4 w-4 shrink-0 !text-rose-600 opacity-100"
                              strokeWidth={2}
                            />
                            <span className="!text-rose-600">
                              Delete Quote
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Conditional Compact Server Pagination Footer */}
        {totalQuotes > limit && (
          <div className="pt-4 sm:pt-6 border-t border-border/40 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            {/* Left: Result Range Info */}
            <div className="text-foreground-secondary font-medium order-2 sm:order-1">
              Showing <span className="text-foreground font-semibold">{startRange}–{endRange}</span> of{' '}
              <span className="text-foreground font-semibold">{totalQuotes}</span> quotes
            </div>

            {/* Center: Page Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-xs font-medium"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Buttons */}
                {pageNumbers.map((pNum, idx) => {
                  if (pNum === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="h-8 w-6 flex items-center justify-center text-foreground-secondary/60 text-xs font-medium"
                      >
                        …
                      </span>
                    );
                  }

                  const isCurrent = page === pNum;
                  return (
                    <button
                      key={`page-${pNum}`}
                      type="button"
                      onClick={() => setPage(pNum)}
                      className={`h-8 min-w-8 px-2 rounded-lg text-xs transition-all flex items-center justify-center ${isCurrent
                        ? 'bg-primary text-white shadow-2xs font-bold'
                        : 'bg-card border border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground font-medium'
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-xs font-medium"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right: Page Size Selector */}
            <div className="flex items-center gap-2 shrink-0 order-3">
              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs sm:text-sm rounded-lg border-border bg-card px-2.5 min-w-22">
                  <SelectValue placeholder={`Show ${limit}`} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="5" className="text-xs sm:text-sm">Show 5</SelectItem>
                  <SelectItem value="10" className="text-xs sm:text-sm">Show 10</SelectItem>
                  <SelectItem value="20" className="text-xs sm:text-sm">Show 20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* 5. Assign Quote Modal */}
      {selectedQuoteForAssign && (
        <AssignQuoteModal
          open={Boolean(selectedQuoteForAssign)}
          onOpenChange={(open) => {
            if (!open) setSelectedQuoteForAssign(null);
          }}
          quote={selectedQuoteForAssign}
          onSuccess={() => {
            refetch();
            refetchAssignments();
          }}
        />
      )}

      {/* 6. Quote Details Modal */}
      {selectedQuoteForView && (
        <QuoteDetailsModal
          open={Boolean(selectedQuoteForView)}
          onOpenChange={(open) => {
            if (!open) setSelectedQuoteForView(null);
          }}
          quote={selectedQuoteForView}
          assignments={assignments}
          onOpenAssign={(quote) => {
            setSelectedQuoteForView(null);
            setSelectedQuoteForAssign(quote);
          }}
        />
      )}

      {/* 7. Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Quote"
        description="Are you sure you want to permanently delete this quote? Any active assignments will also be affected."
        confirmText="Delete Quote"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteQuote.isPending}
      />
    </div>
  );
}
