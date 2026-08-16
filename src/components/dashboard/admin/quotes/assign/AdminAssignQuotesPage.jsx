'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Link2,
  Search,
  Users,
  QrCode,
  CheckCircle2,
  X,
  Trash2,
  AlertCircle,
  Quote as QuoteIcon,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAssignableQuotes,
  useAssignableTags,
  useAssignableUsers,
  useQuoteAssignments,
  useBulkAssignQuotes,
  useDeleteAssignment,
  useBulkDeleteAssignments,
} from '@/hooks/dashboard/useAdminQuoteAssignment';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/category';
import Pagination from '@/components/ui/Pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Extract valid image URL from quote editorData or image object
 */
export function getQuoteArtworkUrl(quote) {
  if (!quote) return null;

  // 1. Desktop editorData elements
  const desktopElements = quote.editorData?.desktop?.elements || quote.editorData?.elements || [];
  const imageEl = desktopElements.find((e) => e.type === 'image' && e.imageData?.source?.url);

  // 2. Mobile editorData elements
  const mobileElements = quote.editorData?.mobile?.elements || [];
  const mobileImageEl = mobileElements.find((e) => e.type === 'image' && e.imageData?.source?.url);

  // 3. Editor background
  const visualBg = quote.editorData?.desktop?.background || quote.editorData?.mobile?.background;
  const visualBgImg = visualBg?.type === 'image' && visualBg.source?.url;

  // 4. Legacy image URL
  const legacyImg = quote.image?.url || (typeof quote.image === 'string' ? quote.image : null);

  const customImg =
    imageEl?.imageData?.source?.url ||
    mobileImageEl?.imageData?.source?.url ||
    visualBgImg ||
    legacyImg;

  if (
    customImg &&
    typeof customImg === 'string' &&
    (customImg.startsWith('http://') ||
      customImg.startsWith('https://') ||
      customImg.startsWith('/'))
  ) {
    return customImg;
  }
  return null;
}

/**
 * Generate card background style (custom image or clean neutral visual background)
 */
export function getQuoteCardStyle(quote) {
  if (!quote) return {};
  const customImg = getQuoteArtworkUrl(quote);
  if (customImg) {
    return {
      backgroundImage: `url(${customImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  const visualBg = quote.editorData?.desktop?.background || quote.editorData?.mobile?.background;
  if (visualBg?.type === 'solid' && visualBg.value) {
    return { backgroundColor: visualBg.value };
  }
  if (visualBg?.type === 'gradient' && visualBg.value) {
    return { background: visualBg.value };
  }

  // Clean neutral visual background fallback (no random images)
  return {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
  };
}

export default function AdminAssignQuotesPage() {
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'manage'
  const [targetType, setTargetType] = useState('tag'); // 'tag' | 'user'

  // Selected Quote State (preserved across assignment, pagination, and search)
  const [selectedQuote, setSelectedQuote] = useState(null);

  // Quote search & pagination (6 per page)
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quotePage, setQuotePage] = useState(1);
  const debouncedQuoteSearch = useDebounce(quoteSearch, 300);

  // Recipient search & pagination (10 per page)
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientPage, setRecipientPage] = useState(1);
  const debouncedRecipientSearch = useDebounce(recipientSearch, 300);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  // Recipient metadata cache to preserve labels across pages
  const [recipientMetaCache, setRecipientMetaCache] = useState(new Map());

  // Unassign dialog state
  const [unassignTarget, setUnassignTarget] = useState(null);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);

  // Queries with Server-Side Pagination
  const { data: quotesResult, isLoading: isQuotesLoading } = useAssignableQuotes({
    search: debouncedQuoteSearch,
    page: quotePage,
    limit: 6,
  });

  const quotes = quotesResult?.data || [];
  const quotesMeta = quotesResult?.meta || { page: 1, limit: 6, total: 0, totalPage: 1 };

  const { data: tagsResult, isLoading: isTagsLoading } = useAssignableTags({
    search: debouncedRecipientSearch,
    page: recipientPage,
    limit: 10,
  });

  const rawTags = tagsResult?.data || [];
  const tagsMeta = tagsResult?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  const { data: usersResult, isLoading: isUsersLoading } = useAssignableUsers({
    search: debouncedRecipientSearch,
    page: recipientPage,
    limit: 10,
  });

  const rawUsers = usersResult?.data || [];
  const usersMeta = usersResult?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  // Deduplicate users and tags by stable ID to guarantee uniqueness in the UI
  const uniqueUsers = useMemo(() => {
    const seen = new Set();
    return rawUsers.filter((u) => {
      const id = (u._id || u.id)?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [rawUsers]);

  const uniqueTags = useMemo(() => {
    const seen = new Set();
    return rawTags.filter((t) => {
      const id = (t._id || t.id)?.toString();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [rawTags]);

  // Cache recipient metadata when tags/users load so selected chips render across page switches
  useEffect(() => {
    if (uniqueTags.length > 0) {
      setRecipientMetaCache((prev) => {
        const next = new Map(prev);
        uniqueTags.forEach((t) => {
          const id = (t._id || t.id)?.toString();
          if (id) {
            next.set(id, {
              _id: id,
              label: t.tagCode,
              type: 'tag',
            });
          }
        });
        return next;
      });
    }
  }, [uniqueTags]);

  useEffect(() => {
    if (uniqueUsers.length > 0) {
      setRecipientMetaCache((prev) => {
        const next = new Map(prev);
        uniqueUsers.forEach((u) => {
          const id = (u._id || u.id)?.toString();
          if (id) {
            next.set(id, {
              _id: id,
              label: `${u.name || 'User'} (${u.email || ''})`,
              type: 'user',
            });
          }
        });
        return next;
      });
    }
  }, [uniqueUsers]);

  // Query all active assignments for smart state resolution & manage tab
  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    refetch: refetchAssignments,
  } = useQuoteAssignments({ limit: 500, isActive: true });

  const assignments = assignmentsData?.data || [];

  // Mutations
  const bulkAssignMutation = useBulkAssignQuotes();
  const deleteAssignmentMutation = useDeleteAssignment();
  const bulkDeleteMutation = useBulkDeleteAssignments();

  // Memoized Lookup Map: Map<recipientId, { quoteIds: Set<string>, assignments: Array }>
  const recipientAssignmentsMap = useMemo(() => {
    const map = new Map();
    assignments.forEach((a) => {
      if (a.isActive === false) return;
      
      const qId = a.quote?._id?.toString() || (typeof a.quote === 'string' ? a.quote : a.quote?.toString?.());
      if (!qId) return;

      let recId = null;
      if (a.assignmentType === 'tag') {
        recId = a.tag?._id?.toString() || (typeof a.tag === 'string' ? a.tag : a.tag?.toString?.());
      } else if (a.assignmentType === 'user') {
        recId = a.user?._id?.toString() || (typeof a.user === 'string' ? a.user : a.user?.toString?.());
      }

      if (!recId) return;
      const key = recId.toString();

      if (!map.has(key)) {
        map.set(key, {
          quoteIds: new Set(),
          assignments: [],
        });
      }
      const entry = map.get(key);
      entry.quoteIds.add(qId.toString());
      entry.assignments.push(a);
    });
    return map;
  }, [assignments]);

  /**
   * Smart Recipient State Calculator:
   * Evaluated against CURRENTLY SELECTED QUOTE + RECIPIENT
   * - STATE 1 — AVAILABLE: Selected quote is NOT assigned to this recipient.
   * - STATE 2 — ALREADY ASSIGNED: Selected quote is already assigned. Checkbox disabled.
   * - STATE 3 — HAS OTHER QUOTES: Recipient has 1+ different quotes, but NOT selected quote. Checkbox enabled.
   */
  const getRecipientState = (recipientId) => {
    if (!recipientId) {
      return {
        isAlreadyAssigned: false,
        hasOtherQuotes: false,
        otherQuotesCount: 0,
        isSelectable: true,
        stateType: 'AVAILABLE',
      };
    }

    const key = recipientId.toString();
    const entry = recipientAssignmentsMap.get(key);
    if (!entry || entry.quoteIds.size === 0) {
      return {
        isAlreadyAssigned: false,
        hasOtherQuotes: false,
        otherQuotesCount: 0,
        isSelectable: true,
        stateType: 'AVAILABLE',
      };
    }

    if (!selectedQuote) {
      const totalCount = entry.quoteIds.size;
      return {
        isAlreadyAssigned: false,
        hasOtherQuotes: totalCount > 0,
        otherQuotesCount: totalCount,
        isSelectable: true,
        stateType: totalCount > 0 ? 'HAS_OTHER_QUOTES' : 'AVAILABLE',
      };
    }

    const selectedQuoteId = (selectedQuote._id || selectedQuote.id)?.toString();
    const isAlreadyAssigned = entry.quoteIds.has(selectedQuoteId);

    let otherQuotesCount = 0;
    entry.quoteIds.forEach((id) => {
      if (id !== selectedQuoteId) otherQuotesCount++;
    });

    if (isAlreadyAssigned) {
      return {
        isAlreadyAssigned: true,
        hasOtherQuotes: otherQuotesCount > 0,
        otherQuotesCount,
        isSelectable: false, // Checkbox disabled
        stateType: 'ALREADY_ASSIGNED',
      };
    }

    if (otherQuotesCount > 0) {
      return {
        isAlreadyAssigned: false,
        hasOtherQuotes: true,
        otherQuotesCount,
        isSelectable: true, // Checkbox enabled
        stateType: 'HAS_OTHER_QUOTES',
      };
    }

    return {
      isAlreadyAssigned: false,
      hasOtherQuotes: false,
      otherQuotesCount: 0,
      isSelectable: true,
      stateType: 'AVAILABLE',
    };
  };

  // Reset pagination when searches change
  const handleQuoteSearchChange = (val) => {
    setQuoteSearch(val);
    setQuotePage(1);
  };

  const handleRecipientSearchChange = (val) => {
    setRecipientSearch(val);
    setRecipientPage(1);
  };

  const handleTargetTypeChange = (type) => {
    setTargetType(type);
    setSelectedRecipientIds([]); // Reset recipient selection only
    setRecipientPage(1);
    setRecipientSearch('');
    // selectedQuote remains unchanged!
  };

  // Handle Quote Selection
  const handleSelectQuote = (quote) => {
    const qId = quote._id || quote.id;
    if ((selectedQuote?._id || selectedQuote?.id) === qId) {
      setSelectedQuote(null);
      return;
    }

    setSelectedQuote(quote);

    // Auto-remove any selected recipients that are already assigned to the newly selected quote
    setSelectedRecipientIds((prev) => {
      return prev.filter((recId) => {
        const entry = recipientAssignmentsMap.get(recId.toString());
        if (!entry) return true;
        return !entry.quoteIds.has(qId.toString());
      });
    });
  };

  // Toggle single recipient (multi-page state preserved)
  const handleToggleRecipient = (id) => {
    const state = getRecipientState(id);
    if (!state.isSelectable) return;

    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all visible AVAILABLE recipients on CURRENT PAGE (skips Already Assigned and Has Other Quotes)
  const handleSelectAllVisible = () => {
    const visibleList = targetType === 'tag' ? uniqueTags : uniqueUsers;
    const availableOnPage = visibleList
      .filter((item) => {
        const id = (item._id || item.id)?.toString();
        const state = getRecipientState(id);
        return state.stateType === 'AVAILABLE';
      })
      .map((item) => (item._id || item.id)?.toString());

    if (availableOnPage.length === 0) {
      toast.error(`No available ${targetType === 'tag' ? 'tags' : 'users'} to select on this page.`);
      return;
    }

    setSelectedRecipientIds((prev) => Array.from(new Set([...prev, ...availableOnPage])));
  };

  // Clear all selected recipients
  const handleClearSelected = () => {
    setSelectedRecipientIds([]);
  };

  // Submit Assignment (Post-Assignment UX: Quote retained, recipients reset, state updated)
  const handleAssignQuote = async () => {
    if (!selectedQuote) {
      toast.error('Please select a quote first');
      return;
    }
    if (selectedRecipientIds.length === 0) {
      toast.error(`Please select at least one ${targetType === 'tag' ? 'QR Tag' : 'User'}`);
      return;
    }

    try {
      const res = await bulkAssignMutation.mutateAsync({
        quote: selectedQuote._id,
        assignmentType: targetType,
        targetIds: selectedRecipientIds,
      });

      const summary = res?.data?.summary || res?.summary;
      if (summary) {
        const parts = [];
        if (summary.newlyAssigned > 0) {
          parts.push(
            `${summary.newlyAssigned} recipient${summary.newlyAssigned === 1 ? '' : 's'} assigned successfully.`
          );
        }
        if (summary.alreadyAssigned > 0) {
          parts.push(`${summary.alreadyAssigned} was already assigned.`);
        }
        if (summary.failed > 0) {
          parts.push(`${summary.failed} failed.`);
        }
        toast.success(parts.join(' ') || 'Quote assigned successfully');
      } else {
        toast.success('Quote assigned successfully');
      }

      // 1. Clear recipient selection (Quote remains selected!)
      setSelectedRecipientIds([]);

      // 2. Refetch assignments and update state
      try {
        await refetchAssignments();
      } catch {
        toast.error('Assignment completed, but the recipient list could not be refreshed.');
      }
    } catch (err) {
      console.error('Failed to assign quote:', err);
      // Keep selected recipients selected so user can retry!
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign quote');
    }
  };

  // Handle Unassign Confirm
  const handleConfirmUnassign = async () => {
    if (!unassignTarget) return;

    try {
      if (Array.isArray(unassignTarget)) {
        await bulkDeleteMutation.mutateAsync(unassignTarget);
        toast.success(`Removed ${unassignTarget.length} assignment(s)`);
      } else {
        await deleteAssignmentMutation.mutateAsync(unassignTarget);
        toast.success('Assignment removed successfully');
      }
      setUnassignDialogOpen(false);
      setUnassignTarget(null);
      refetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to remove assignment');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Link2 size={20} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Assign Quotes</h1>
              <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
                Assign quotes to QR tags, users, or multiple recipients.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('assign')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'assign'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Assign Quote
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            Active Assignments
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'assign' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Visual Quote Picker & Selected Quote Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. SELECT QUOTE Card (Fixed Height Container) */}
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs max-h-[580px]">
                <div className="space-y-3.5 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <QuoteIcon size={14} className="text-primary" />
                      <span>1. Select Quote</span>
                    </span>
                    {selectedQuote && (
                      <button
                        type="button"
                        onClick={() => setSelectedQuote(null)}
                        className="text-xs text-primary font-medium hover:underline cursor-pointer"
                      >
                        Change Quote
                      </button>
                    )}
                  </div>

                  {/* Selected Quote Summary Banner */}
                  {selectedQuote && (
                    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2 transition-all shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-primary" />
                          <span>Selected for Assignment</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedQuote(null)}
                          className="text-[10px] font-medium text-foreground-secondary hover:text-destructive transition-colors cursor-pointer"
                        >
                          Deselect
                        </button>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div
                          style={getQuoteCardStyle(selectedQuote)}
                          className="w-12 h-12 rounded-lg shrink-0 border border-border/80 relative overflow-hidden flex items-end p-1 shadow-2xs"
                        >
                          <div className="absolute inset-0 bg-black/40" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-serif italic font-medium text-foreground line-clamp-2 leading-snug">
                            &ldquo;{selectedQuote.text}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-foreground-tertiary">
                            {selectedQuote.author && (
                              <span className="text-foreground-secondary font-medium truncate max-w-[120px]">
                                — {selectedQuote.author}
                              </span>
                            )}
                            <span>·</span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border capitalize ${getCategoryBadgeClass(
                                selectedQuote.category
                              )}`}
                            >
                              {getCategoryLabel(selectedQuote.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative shrink-0">
                    <Search
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                    />
                    <input
                      type="text"
                      value={quoteSearch}
                      onChange={(e) => handleQuoteSearchChange(e.target.value)}
                      placeholder="Search quotes by text, author, or category..."
                      className="w-full h-8.5 pl-8.5 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Visual Quote Card Grid (6 per page) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1 min-h-[220px]">
                    {isQuotesLoading ? (
                      <div className="col-span-full p-8 text-center text-xs text-foreground-tertiary animate-pulse flex items-center justify-center">
                        Loading quotes...
                      </div>
                    ) : quotes.length === 0 ? (
                      <div className="col-span-full p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1">
                        <p className="font-semibold text-foreground-secondary">No quotes found</p>
                        <p className="text-[11px]">
                          {quoteSearch ? 'Try a different search term.' : 'No active quotes available.'}
                        </p>
                      </div>
                    ) : (
                      quotes.map((quote) => {
                        const isSelected = selectedQuote?._id === quote._id;
                        const cardStyle = getQuoteCardStyle(quote);

                        return (
                          <div
                            key={quote._id}
                            onClick={() => handleSelectQuote(quote)}
                            style={cardStyle}
                            className={`relative min-h-[110px] rounded-xl p-2.5 flex flex-col justify-between overflow-hidden cursor-pointer select-none transition-all duration-150 group border ${
                              isSelected
                                ? 'ring-2 ring-primary border-primary shadow-xs'
                                : 'border-border/60 hover:border-primary/50 hover:shadow-2xs'
                            }`}
                          >
                            {/* Dark Overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35 pointer-events-none transition-opacity group-hover:from-black/90" />

                            {/* Top Row: Checkmark / Category / Active */}
                            <div className="relative z-10 flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {isSelected ? (
                                  <span className="w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
                                    <CheckCircle2 size={12} className="stroke-[2.5]" />
                                  </span>
                                ) : (
                                  <span className="w-4.5 h-4.5 rounded-full border border-white/30 bg-black/30 group-hover:border-white/60 transition-colors shrink-0" />
                                )}
                                <span
                                  className={`text-[8.5px] font-semibold px-1.5 py-0.2 rounded-full border capitalize backdrop-blur-md truncate ${getCategoryBadgeClass(
                                    quote.category
                                  )}`}
                                >
                                  {getCategoryLabel(quote.category)}
                                </span>
                              </div>
                              <span className="text-[8.5px] font-semibold px-1.5 py-0.2 rounded-full backdrop-blur-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                Active
                              </span>
                            </div>

                            {/* Middle/Bottom: Quote Text & Author */}
                            <div className="relative z-10 my-auto text-left pt-1.5 pb-0.5">
                              <p className="text-[11px] font-serif italic font-medium text-white line-clamp-3 leading-snug drop-shadow-xs">
                                &ldquo;{quote.text}&rdquo;
                              </p>
                              {quote.author && (
                                <p className="text-[9.5px] text-white/80 font-sans tracking-wide mt-0.5 drop-shadow-2xs truncate">
                                  — {quote.author}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Quote Picker Pagination (Dashboard Standard) */}
                {quotesMeta.total > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-2 border-t border-border/80 text-xs shrink-0">
                    <span className="text-foreground-tertiary text-[11px]">
                      Showing{' '}
                      <span className="font-semibold text-foreground">
                        {(quotePage - 1) * quotesMeta.limit + 1}–
                        {Math.min(quotePage * quotesMeta.limit, quotesMeta.total)}
                      </span>{' '}
                      of <span className="font-semibold text-foreground">{quotesMeta.total}</span>
                    </span>

                    <Pagination
                      currentPage={quotePage}
                      totalPages={quotesMeta.totalPage}
                      onPageChange={setQuotePage}
                      className="self-end sm:self-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recipient Selection with Smart States & Pagination (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between shadow-xs max-h-[580px]">
                <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                  {/* Step 2 Header & Target Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border shrink-0">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      <span>2. Choose Target Recipients</span>
                    </span>

                    {/* Target Type Selector */}
                    <div className="flex items-center rounded-lg bg-muted/60 p-0.5 border border-border">
                      <button
                        type="button"
                        onClick={() => handleTargetTypeChange('tag')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          targetType === 'tag'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                      >
                        <QrCode size={12} />
                        <span>QR Tags</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTargetTypeChange('user')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          targetType === 'user'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-foreground-secondary hover:text-foreground'
                        }`}
                      >
                        <Users size={12} />
                        <span>Users</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Bulk Select Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <div className="relative flex-1 w-full">
                      <Search
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                      />
                      <input
                        type="text"
                        value={recipientSearch}
                        onChange={(e) => handleRecipientSearchChange(e.target.value)}
                        placeholder={
                          targetType === 'tag'
                            ? 'Search tags by code...'
                            : 'Search users by name or email...'
                        }
                        className="w-full h-8.5 pl-8.5 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={handleSelectAllVisible}
                        className="flex-1 sm:flex-initial h-8.5 px-2.5 rounded-xl border border-border hover:bg-muted text-foreground-secondary hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Select All Available on This Page
                      </button>
                      {selectedRecipientIds.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearSelected}
                          className="flex-1 sm:flex-initial h-8.5 px-2.5 rounded-xl border border-border hover:bg-muted text-destructive text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Clear ({selectedRecipientIds.length})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compact Recipient Selection List (Fixed Scrollable Area) */}
                  <div className="space-y-1.5 flex-1 overflow-y-auto pr-1 min-h-[220px]">
                    {targetType === 'tag' ? (
                      isTagsLoading ? (
                        <div className="p-8 text-center text-xs text-foreground-tertiary animate-pulse flex items-center justify-center">
                          Loading QR tags...
                        </div>
                      ) : uniqueTags.length === 0 ? (
                        <div className="p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1">
                          <p className="font-semibold text-foreground-secondary">No tags found</p>
                          <p className="text-[11px]">
                            {recipientSearch ? 'Try a different search query.' : 'No QR tags available.'}
                          </p>
                        </div>
                      ) : (
                        uniqueTags.map((tag) => {
                          const tagId = (tag._id || tag.id)?.toString();
                          const isSelected = selectedRecipientIds.includes(tagId);
                          const state = getRecipientState(tagId);

                          return (
                            <div
                              key={tagId}
                              onClick={() => {
                                if (state.isSelectable) {
                                  handleToggleRecipient(tagId);
                                }
                              }}
                              className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all min-h-[50px] ${
                                !state.isSelectable
                                  ? 'opacity-65 bg-muted/20 border-border cursor-not-allowed'
                                  : isSelected
                                  ? 'border-primary/50 bg-primary/5 shadow-2xs cursor-pointer'
                                  : 'border-border bg-background hover:bg-muted/40 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!state.isSelectable}
                                  onChange={() => {}}
                                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 pointer-events-none disabled:opacity-40"
                                />
                                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground-secondary shrink-0">
                                  <QrCode size={14} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate leading-tight">
                                    {tag.tagCode}
                                  </p>
                                  <p className="text-[10px] text-foreground-tertiary truncate">
                                    {tag.isActivated ? 'Activated' : 'Unactivated'} ·{' '}
                                    {tag.subscriptionType || 'Free'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Smart State Badges */}
                                {state.stateType === 'ALREADY_ASSIGNED' && (
                                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Already Assigned
                                  </span>
                                )}
                                {state.stateType === 'HAS_OTHER_QUOTES' && (
                                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    Has {state.otherQuotesCount} other{' '}
                                    {state.otherQuotesCount === 1 ? 'quote' : 'quotes'}
                                  </span>
                                )}
                                {state.stateType === 'AVAILABLE' && (
                                  <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    Available
                                  </span>
                                )}
                                <span
                                  className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${
                                    tag.isActive
                                      ? 'bg-muted text-foreground-secondary border-border'
                                      : 'bg-muted text-foreground-tertiary border-border'
                                  }`}
                                >
                                  {tag.isActive ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : isUsersLoading ? (
                      <div className="p-8 text-center text-xs text-foreground-tertiary animate-pulse flex items-center justify-center">
                        Loading users...
                      </div>
                    ) : uniqueUsers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1">
                        <p className="font-semibold text-foreground-secondary">No users found</p>
                        <p className="text-[11px]">
                          {recipientSearch ? 'Try a different search query.' : 'No users available.'}
                        </p>
                      </div>
                    ) : (
                      uniqueUsers.map((user) => {
                        const userId = (user._id || user.id)?.toString();
                        const isSelected = selectedRecipientIds.includes(userId);
                        const state = getRecipientState(userId);

                        return (
                          <div
                            key={userId}
                            onClick={() => {
                              if (state.isSelectable) {
                                handleToggleRecipient(userId);
                              }
                            }}
                            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all min-h-[50px] ${
                              !state.isSelectable
                                ? 'opacity-65 bg-muted/20 border-border cursor-not-allowed'
                                : isSelected
                                ? 'border-primary/50 bg-primary/5 shadow-2xs cursor-pointer'
                                : 'border-border bg-background hover:bg-muted/40 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!state.isSelectable}
                                onChange={() => {}}
                                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 pointer-events-none disabled:opacity-40"
                              />
                              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate leading-tight">
                                  {user.name || 'Anonymous User'}
                                </p>
                                <p className="text-[10px] text-foreground-tertiary truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {state.stateType === 'ALREADY_ASSIGNED' && (
                                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Already Assigned
                                </span>
                              )}
                              {state.stateType === 'HAS_OTHER_QUOTES' && (
                                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                  Has {state.otherQuotesCount} other{' '}
                                  {state.otherQuotesCount === 1 ? 'quote' : 'quotes'}
                                </span>
                              )}
                              {state.stateType === 'AVAILABLE' && (
                                <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Available
                                </span>
                              )}
                              <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground-secondary border border-border capitalize">
                                {user.role || 'user'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Recipient Pagination (Dashboard Standard) */}
                {(targetType === 'tag' ? tagsMeta.total : usersMeta.total) > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-2 border-t border-border/80 text-xs shrink-0">
                    <span className="text-foreground-tertiary text-[11px]">
                      Showing{' '}
                      <span className="font-semibold text-foreground">
                        {(recipientPage - 1) * (targetType === 'tag' ? tagsMeta.limit : usersMeta.limit) + 1}–
                        {Math.min(
                          recipientPage * (targetType === 'tag' ? tagsMeta.limit : usersMeta.limit),
                          targetType === 'tag' ? tagsMeta.total : usersMeta.total
                        )}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-foreground">
                        {targetType === 'tag' ? tagsMeta.total : usersMeta.total}
                      </span>
                    </span>

                    <Pagination
                      currentPage={recipientPage}
                      totalPages={targetType === 'tag' ? tagsMeta.totalPage : usersMeta.totalPage}
                      onPageChange={setRecipientPage}
                      className="self-end sm:self-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Recipients Action Bar (Sticky or bottom summary) */}
          {selectedRecipientIds.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-card p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>
                    Selected Recipients ({selectedRecipientIds.length}{' '}
                    {targetType === 'tag' ? 'Tags' : 'Users'})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleClearSelected}
                  className="text-xs text-destructive hover:underline cursor-pointer font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Chips (cached across pages) */}
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {selectedRecipientIds.map((id) => {
                  const cached = recipientMetaCache.get(id.toString());
                  const label = cached?.label || id;

                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      <span className="truncate max-w-[200px]">{label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleRecipient(id)}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Assign Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAssignQuote}
                  disabled={bulkAssignMutation.isPending || !selectedQuote}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {bulkAssignMutation.isPending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Link2 size={14} />
                      <span>
                        Assign Quote to {selectedRecipientIds.length}{' '}
                        {targetType === 'tag' ? 'Tag(s)' : 'User(s)'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Manage Active Assignments Tab */
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              All Active Quote Assignments ({assignments.length})
            </h2>
            <button
              type="button"
              onClick={() => refetchAssignments()}
              className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground-secondary cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {isAssignmentsLoading ? (
            <div className="p-12 text-center text-xs text-foreground-tertiary animate-pulse">
              Loading active assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl">
              No quote assignments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-foreground-tertiary uppercase text-[10px] font-semibold">
                    <th className="pb-3 px-3">Quote</th>
                    <th className="pb-3 px-3">Target Type</th>
                    <th className="pb-3 px-3">Recipient</th>
                    <th className="pb-3 px-3">Assigned Date</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {assignments.map((assignment) => (
                    <tr key={assignment._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3 max-w-[240px]">
                        <p className="font-medium text-foreground truncate">
                          &ldquo;{assignment.quote?.text || 'Untitled Quote'}&rdquo;
                        </p>
                        <p className="text-[11px] text-foreground-tertiary truncate">
                          {assignment.quote?.author ? `— ${assignment.quote.author}` : ''}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border font-medium text-[10px] capitalize">
                          {assignment.assignmentType === 'tag' ? (
                            <QrCode size={11} />
                          ) : (
                            <Users size={11} />
                          )}
                          <span>{assignment.assignmentType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {assignment.assignmentType === 'tag'
                          ? assignment.tag?.tagCode || 'Unknown Tag'
                          : assignment.user?.name || assignment.user?.email || 'Unknown User'}
                      </td>
                      <td className="py-3 px-3 text-foreground-tertiary">
                        {formatDate(assignment.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            assignment.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-muted text-foreground-tertiary border-border'
                          }`}
                        >
                          {assignment.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setUnassignTarget(assignment._id);
                            setUnassignDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-foreground-tertiary hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Remove assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Unassign Confirmation Dialog */}
      <Dialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertCircle size={18} />
              <span>Remove Quote Assignment?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-foreground-secondary mt-2">
              This quote will no longer be assigned to the selected recipient(s). Scans or user
              requests will revert to default quote behavior.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setUnassignDialogOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmUnassign}
              disabled={deleteAssignmentMutation.isPending || bulkDeleteMutation.isPending}
              className="px-4 py-2 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {deleteAssignmentMutation.isPending || bulkDeleteMutation.isPending ? (
                <span>Removing...</span>
              ) : (
                <span>Remove Assignment</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
