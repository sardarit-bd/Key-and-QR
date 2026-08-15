'use client';

import { useState, useMemo } from 'react';
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
import { resolveBackgroundImage } from '@/components/category/categoryImages';
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

function getQuoteCardBackground(quote) {
  if (!quote) return {};
  const desktopElements = quote.editorData?.desktop?.elements || quote.editorData?.elements || [];
  const imageEl = desktopElements.find((e) => e.type === 'image' && e.imageData?.source?.url);
  const visualBg = quote.editorData?.desktop?.background;
  const visualBgImg = visualBg?.type === 'image' && visualBg.source?.url;

  const customImg = imageEl?.imageData?.source?.url || visualBgImg || quote.image?.url;
  const bgUrl = resolveBackgroundImage(quote.category, customImg);

  if (!customImg && visualBg?.type === 'solid' && visualBg.value) {
    return { backgroundColor: visualBg.value };
  }
  if (!customImg && visualBg?.type === 'gradient' && visualBg.value) {
    return { background: visualBg.value };
  }
  return {
    backgroundImage: `url(${bgUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

export default function AdminAssignQuotesPage() {
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'manage'
  const [targetType, setTargetType] = useState('tag'); // 'tag' | 'user'

  // Selected Quote
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [isQuotePickerOpen, setIsQuotePickerOpen] = useState(false);
  const debouncedQuoteSearch = useDebounce(quoteSearch, 300);

  // Recipient search & selection
  const [recipientSearch, setRecipientSearch] = useState('');
  const debouncedRecipientSearch = useDebounce(recipientSearch, 300);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  // Unassign dialog state
  const [unassignTarget, setUnassignTarget] = useState(null); // single id or array
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);

  // Queries (Guaranteed Tag[], User[], Quote[] from normalized hooks)
  const { data: quotes = [], isLoading: isQuotesLoading } = useAssignableQuotes({
    search: debouncedQuoteSearch,
  });

  const { data: tags = [], isLoading: isTagsLoading } = useAssignableTags({
    search: debouncedRecipientSearch,
  });

  const { data: users = [], isLoading: isUsersLoading } = useAssignableUsers({
    search: debouncedRecipientSearch,
  });

  // Query existing assignments for selected quote (or all for manage tab)
  const assignmentFilters = useMemo(() => {
    const f = { limit: 100 };
    if (activeTab === 'assign' && selectedQuote) {
      f.quote = selectedQuote._id;
    }
    return f;
  }, [activeTab, selectedQuote]);

  const { data: assignmentsData, isLoading: isAssignmentsLoading, refetch: refetchAssignments } =
    useQuoteAssignments(assignmentFilters);

  const assignments = assignmentsData?.data || [];

  // Mutations
  const bulkAssignMutation = useBulkAssignQuotes();
  const deleteAssignmentMutation = useDeleteAssignment();
  const bulkDeleteMutation = useBulkDeleteAssignments();

  // Existing assignments for selected quote by target ID
  const existingAssignedTargetMap = useMemo(() => {
    if (!selectedQuote) return new Map();
    const map = new Map();
    assignments.forEach((a) => {
      if (a.quote?._id === selectedQuote._id || a.quote === selectedQuote._id) {
        if (a.assignmentType === 'tag' && a.tag) {
          map.set(a.tag._id || a.tag, a);
        } else if (a.assignmentType === 'user' && a.user) {
          map.set(a.user._id || a.user, a);
        }
      }
    });
    return map;
  }, [selectedQuote, assignments]);

  // Selected Recipient Objects
  const selectedRecipients = useMemo(() => {
    if (targetType === 'tag') {
      return tags.filter((t) => selectedRecipientIds.includes(t._id));
    }
    return users.filter((u) => selectedRecipientIds.includes(u._id));
  }, [targetType, tags, users, selectedRecipientIds]);

  // Toggle single recipient
  const handleToggleRecipient = (id) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all visible recipients
  const handleSelectAllVisible = () => {
    const visibleList = targetType === 'tag' ? tags : users;
    const visibleIds = visibleList.map((item) => item._id);
    setSelectedRecipientIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Clear all selected recipients
  const handleClearSelected = () => {
    setSelectedRecipientIds([]);
  };

  // Submit Assignment
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
        toast.success(
          `Assignment complete: ${summary.newlyAssigned} new, ${summary.alreadyAssigned} already assigned.`
        );
      } else {
        toast.success('Quote assigned successfully');
      }

      setSelectedRecipientIds([]);
      refetchAssignments();
    } catch (err) {
      console.error('Failed to assign quote:', err);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Quote Selector & Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quote Selector Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <QuoteIcon size={14} className="text-primary" />
                  <span>1. Select Quote</span>
                </span>
                {selectedQuote && (
                  <button
                    type="button"
                    onClick={() => setIsQuotePickerOpen(true)}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                  >
                    Change Quote
                  </button>
                )}
              </div>

              {!selectedQuote ? (
                <div
                  onClick={() => setIsQuotePickerOpen(true)}
                  className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <QuoteIcon size={24} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">Select a Quote</p>
                  <p className="text-xs text-foreground-tertiary">
                    Click to search and choose an active quote to assign
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visual Artwork Preview of Selected Quote */}
                  <div
                    style={getQuoteCardBackground(selectedQuote)}
                    className="relative aspect-[16/10] w-full rounded-xl flex flex-col justify-between p-4 overflow-hidden select-none border border-border shadow-xs"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none" />

                    {/* Category & Status */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize backdrop-blur-md ${getCategoryBadgeClass(
                          selectedQuote.category
                        )}`}
                      >
                        {getCategoryLabel(selectedQuote.category)}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Active
                      </span>
                    </div>

                    {/* Quote Text & Author */}
                    <div className="relative z-10 my-auto text-center px-2">
                      <p className="text-xs sm:text-sm font-serif italic font-medium text-white line-clamp-3 leading-snug drop-shadow-sm">
                        &ldquo;{selectedQuote.text}&rdquo;
                      </p>
                      {selectedQuote.author && (
                        <p className="text-[10px] text-white/80 font-sans tracking-wide mt-1.5 drop-shadow-xs">
                          — {selectedQuote.author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Existing Assignments Status */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border text-xs">
                    <span className="text-foreground-secondary font-medium">
                      Current Assignments:
                    </span>
                    <span className="text-foreground font-semibold">
                      {existingAssignedTargetMap.size} recipient(s)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Recipients Summary Card */}
            {selectedRecipientIds.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Selected ({selectedRecipientIds.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="text-xs text-destructive hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedRecipients.map((item) => (
                    <span
                      key={item._id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium"
                    >
                      <span>
                        {targetType === 'tag'
                          ? item.tagCode
                          : `${item.name || 'User'} (${item.email || ''})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRecipient(item._id)}
                        className="hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Assign Action Button */}
                <button
                  type="button"
                  onClick={handleAssignQuote}
                  disabled={bulkAssignMutation.isPending || !selectedQuote}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
            )}
          </div>

          {/* Right Column: Recipient Type & Multi-Select (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              {/* Step 2 Header & Target Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  <span>2. Choose Target Recipients</span>
                </span>

                {/* Target Type Selector */}
                <div className="flex items-center rounded-lg bg-muted/60 p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('tag');
                      setSelectedRecipientIds([]);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      targetType === 'tag'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <QrCode size={13} />
                    <span>QR Tags</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('user');
                      setSelectedRecipientIds([]);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      targetType === 'user'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <Users size={13} />
                    <span>Users</span>
                  </button>
                </div>
              </div>

              {/* Search & Bulk Select Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                  />
                  <input
                    type="text"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    placeholder={
                      targetType === 'tag'
                        ? 'Search tags by code...'
                        : 'Search users by name or email...'
                    }
                    className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="flex-1 sm:flex-initial h-9 px-3 rounded-xl border border-border hover:bg-muted text-foreground-secondary hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Select All Visible
                  </button>
                  {selectedRecipientIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSelected}
                      className="flex-1 sm:flex-initial h-9 px-3 rounded-xl border border-border hover:bg-muted text-destructive text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Recipient Selection List */}
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {targetType === 'tag' ? (
                  isTagsLoading ? (
                    <div className="p-8 text-center text-xs text-foreground-tertiary animate-pulse">
                      Loading QR tags...
                    </div>
                  ) : tags.length === 0 ? (
                    <div className="p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl">
                      No tags found matching criteria.
                    </div>
                  ) : (
                    tags.map((tag) => {
                      const isSelected = selectedRecipientIds.includes(tag._id);
                      const isAlreadyAssigned = existingAssignedTargetMap.has(tag._id);

                      return (
                        <div
                          key={tag._id}
                          onClick={() => handleToggleRecipient(tag._id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary/50 bg-primary/5 shadow-xs'
                              : 'border-border bg-background hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-border text-primary focus:ring-primary h-4 w-4 pointer-events-none"
                            />
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground-secondary shrink-0">
                              <QrCode size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {tag.tagCode}
                              </p>
                              <p className="text-[11px] text-foreground-tertiary truncate">
                                {tag.isActivated ? 'Activated' : 'Unactivated'} ·{' '}
                                {tag.subscriptionType || 'Free'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isAlreadyAssigned && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Assigned
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                tag.isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
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
                  <div className="p-8 text-center text-xs text-foreground-tertiary animate-pulse">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl">
                    No users found matching criteria.
                  </div>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedRecipientIds.includes(user._id);
                    const isAlreadyAssigned = existingAssignedTargetMap.has(user._id);

                    return (
                      <div
                        key={user._id}
                        onClick={() => handleToggleRecipient(user._id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary/50 bg-primary/5 shadow-xs'
                            : 'border-border bg-background hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-border text-primary focus:ring-primary h-4 w-4 pointer-events-none"
                          />
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {user.name || 'Anonymous User'}
                            </p>
                            <p className="text-[11px] text-foreground-tertiary truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAlreadyAssigned && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Assigned
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-foreground-secondary border border-border capitalize">
                            {user.role || 'user'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
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

      {/* Quote Picker Dialog */}
      <Dialog open={isQuotePickerOpen} onOpenChange={setIsQuotePickerOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <QuoteIcon size={18} className="text-primary" />
              <span>Select Quote to Assign</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-foreground-secondary">
              Search and pick an active quote from your library.
            </DialogDescription>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative my-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
            />
            <input
              type="text"
              value={quoteSearch}
              onChange={(e) => setQuoteSearch(e.target.value)}
              placeholder="Search quotes by text, author, or category..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Quotes List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px] max-h-[400px]">
            {isQuotesLoading ? (
              <div className="p-8 text-center text-xs text-foreground-tertiary animate-pulse">
                Loading quotes...
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-foreground-tertiary border border-dashed border-border rounded-xl">
                No active quotes found.
              </div>
            ) : (
              quotes.map((quote) => (
                <div
                  key={quote._id}
                  onClick={() => {
                    setSelectedQuote(quote);
                    setIsQuotePickerOpen(false);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background hover:bg-muted/50 hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-xs font-serif italic font-medium text-foreground line-clamp-2 leading-snug">
                      &ldquo;{quote.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-foreground-tertiary">
                      {quote.author && (
                        <span className="font-medium text-foreground-secondary">
                          — {quote.author}
                        </span>
                      )}
                      <span>·</span>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border capitalize ${getCategoryBadgeClass(
                          quote.category
                        )}`}
                      >
                        {getCategoryLabel(quote.category)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0"
                  >
                    Select
                  </button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

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
