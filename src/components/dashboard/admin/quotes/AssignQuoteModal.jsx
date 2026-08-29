'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Users,
  QrCode,
  CheckCircle2,
  X,
  Trash2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Link2,
  Package,
  User,
  Check,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAssignableTags,
  useAssignableUsers,
  useQuoteAssignments,
  useBulkAssignQuotes,
  useDeleteAssignment,
} from '@/hooks/dashboard/useAdminQuoteAssignment';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/public/quote/category';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getOrderAndCustomerSummary(tag) {
  if (!tag) return 'No Order · No Customer';
  const orderObj = tag.assignedOrderId || tag.order;
  let orderStr = '';
  let customerStr = '';

  if (orderObj) {
    if (orderObj.orderNumber) orderStr = `Order #${orderObj.orderNumber}`;
    else if (orderObj._id) orderStr = `Order #${orderObj._id.slice(-8).toUpperCase()}`;
    else if (typeof orderObj === 'string') orderStr = `Order #${orderObj.slice(-8).toUpperCase()}`;
  } else if (tag.orderId) {
    orderStr = `Order #${tag.orderId.toString().slice(-8).toUpperCase()}`;
  }

  if (tag.owner?.name) {
    customerStr = tag.owner.name;
  } else if (tag.assignedOrderId?.guestCustomer?.fullName) {
    customerStr = tag.assignedOrderId.guestCustomer.fullName;
  } else if (tag.owner?.email) {
    customerStr = tag.owner.email.split('@')[0];
  } else if (tag.assignedOrderId?.guestCustomer?.email) {
    customerStr = tag.assignedOrderId.guestCustomer.email.split('@')[0];
  } else if (tag.assignedOrderId) {
    customerStr = 'Guest Customer';
  }

  if (orderStr && customerStr) return `${orderStr} · ${customerStr}`;
  if (orderStr) return `${orderStr} · No Customer`;
  if (customerStr) return `No Order · ${customerStr}`;
  return 'No Order · No Customer';
}

function getQuoteCardStyle(quote) {
  if (!quote) return {};
  const desktopElements = quote.editorData?.desktop?.elements || quote.editorData?.elements || [];
  const mobileElements = quote.editorData?.mobile?.elements || [];
  const imageEl = desktopElements.find((e) => e.type === 'image' && e.imageData?.source?.url);
  const mobileImageEl = mobileElements.find((e) => e.type === 'image' && e.imageData?.source?.url);
  const visualBg = quote.editorData?.desktop?.background || quote.editorData?.mobile?.background;
  const visualBgImg = visualBg?.type === 'image' && visualBg.source?.url;
  const legacyImg = quote.image?.url || (typeof quote.image === 'string' ? quote.image : null);

  const customImg =
    quote.renderedImages?.desktop?.url ||
    quote.renderedImages?.mobile?.url ||
    imageEl?.imageData?.source?.url ||
    mobileImageEl?.imageData?.source?.url ||
    visualBgImg ||
    legacyImg;

  if (customImg && typeof customImg === 'string' && !customImg.includes('cloudinary.com/demo/')) {
    return {
      backgroundImage: `url(${customImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  if (visualBg?.type === 'solid' && visualBg.value) {
    return { backgroundColor: visualBg.value };
  }
  if (visualBg?.type === 'gradient' && visualBg.value) {
    return { background: visualBg.value };
  }

  return {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)',
  };
}

export default function AssignQuoteModal({ open, onOpenChange, quote, onSuccess }) {
  const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'current'
  const [targetType, setTargetType] = useState('tag'); // 'tag' | 'user'

  const [tagSearch, setTagSearch] = useState('');
  const [tagPage, setTagPage] = useState(1);
  const debouncedTagSearch = useDebounce(tagSearch, 300);

  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // Selected items: Map of ID -> Object { id, label, sublabel }
  const [selectedItems, setSelectedItems] = useState(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const quoteId = (quote?._id || quote?.id)?.toString();

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedItems(new Map());
      setTagSearch('');
      setUserSearch('');
      setActiveTab('assign');
      setTargetType('tag');
    }
  }, [open]);

  // Clear selections when switching target type
  const handleTargetTypeChange = (type) => {
    if (type !== targetType) {
      setTargetType(type);
      setSelectedItems(new Map());
    }
  };

  // Queries
  const { data: tagData, isLoading: tagsLoading } = useAssignableTags({
    search: debouncedTagSearch,
    page: tagPage,
    limit: 10,
  });

  const { data: userData, isLoading: usersLoading } = useAssignableUsers({
    search: debouncedUserSearch,
    page: userPage,
    limit: 10,
  });

  // Fetch current assignments for this quote
  const {
    data: quoteAssignmentsData,
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useQuoteAssignments({ quote: quoteId, isActive: true });

  const bulkAssignMutation = useBulkAssignQuotes();
  const deleteAssignmentMutation = useDeleteAssignment();

  const currentAssignments = useMemo(() => {
    return quoteAssignmentsData?.data || [];
  }, [quoteAssignmentsData]);

  // Set of already assigned tag IDs and user IDs for this quote
  const alreadyAssignedTagIds = useMemo(() => {
    const set = new Set();
    currentAssignments.forEach((a) => {
      if (a.assignmentType === 'tag' && a.tag) {
        const id = a.tag._id?.toString() || (typeof a.tag === 'string' ? a.tag : null);
        if (id) set.add(id);
      }
    });
    return set;
  }, [currentAssignments]);

  const alreadyAssignedUserIds = useMemo(() => {
    const set = new Set();
    currentAssignments.forEach((a) => {
      if (a.assignmentType === 'user' && a.user) {
        const id = a.user._id?.toString() || (typeof a.user === 'string' ? a.user : null);
        if (id) set.add(id);
      }
    });
    return set;
  }, [currentAssignments]);

  const currentTagAssignments = useMemo(
    () => currentAssignments.filter((a) => a.assignmentType === 'tag'),
    [currentAssignments]
  );
  const currentUserAssignments = useMemo(
    () => currentAssignments.filter((a) => a.assignmentType === 'user'),
    [currentAssignments]
  );

  const tags = tagData?.data || [];
  const tagMeta = tagData?.meta || { page: 1, totalPage: 1, total: 0 };

  const users = userData?.data || [];
  const userMeta = userData?.meta || { page: 1, totalPage: 1, total: 0 };

  // Toggle selection of single item
  const toggleItem = (id, label, sublabel) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, { id, label, sublabel });
      }
      return next;
    });
  };

  const removeItem = (id) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // "Select Available" button logic
  const handleSelectAvailable = () => {
    if (targetType === 'tag') {
      const available = tags.filter((t) => !alreadyAssignedTagIds.has(t._id?.toString()));
      if (available.length === 0) {
        toast('No available tags on this page to select', { icon: 'ℹ️' });
        return;
      }
      setSelectedItems((prev) => {
        const next = new Map(prev);
        available.forEach((t) => {
          const id = t._id?.toString();
          next.set(id, {
            id,
            label: t.tagCode,
            sublabel: getOrderAndCustomerSummary(t),
          });
        });
        return next;
      });
    } else {
      const available = users.filter((u) => !alreadyAssignedUserIds.has(u._id?.toString()));
      if (available.length === 0) {
        toast('No available customers on this page to select', { icon: 'ℹ️' });
        return;
      }
      setSelectedItems((prev) => {
        const next = new Map(prev);
        available.forEach((u) => {
          const id = u._id?.toString();
          next.set(id, {
            id,
            label: u.name || u.email?.split('@')[0] || 'Customer',
            sublabel: u.email,
          });
        });
        return next;
      });
    }
  };

  // Assign Submit
  const handleAssignSubmit = async () => {
    if (selectedItems.size === 0 || !quoteId) return;

    setIsSubmitting(true);
    const toastId = toast.loading(`Assigning quote to ${selectedItems.size} recipient(s)...`);

    try {
      const targetIds = Array.from(selectedItems.keys());
      const res = await bulkAssignMutation.mutateAsync({
        quote: quoteId,
        assignmentType: targetType,
        targetIds,
      });

      const newlyAssigned = res?.summary?.newlyAssigned ?? targetIds.length;
      toast.success(`Successfully assigned to ${newlyAssigned} recipient(s)`, { id: toastId });

      setSelectedItems(new Map());
      await refetchAssignments();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign quote', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove assignment
  const handleRemoveAssignment = async (assignmentId) => {
    setRemovingId(assignmentId);
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
      toast.success('Assignment removed');
      await refetchAssignments();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove assignment');
    } finally {
      setRemovingId(null);
    }
  };

  if (!quote) return null;

  const quoteStyle = getQuoteCardStyle(quote);
  const quoteText = quote.text && quote.text.toLowerCase() !== 'untitled quote' ? quote.text : 'Image Quote';
  const authorName = (quote.author || '').replace(/^—\s*/, '').trim();
  const selectedList = Array.from(selectedItems.values());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[740px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border/60">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Assign Quote
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Assign this quote directly to QR Tags or Customers
          </DialogDescription>
        </DialogHeader>

        {/* Compact Quote Preview Header */}
        <div className="p-4 sm:p-6 bg-muted/30 border-b border-border/60 space-y-4">
          <div className="flex items-center gap-4 bg-card border border-border/70 p-4 rounded-xl shadow-2xs">
            {/* Artwork Thumbnail */}
            <div
              style={quoteStyle}
              className="w-16 h-16 rounded-xl shrink-0 border border-border/40 flex items-center justify-center relative overflow-hidden shadow-2xs"
            >
              <div className="absolute inset-0 bg-black/20" />
              <Sparkles className="w-5 h-5 text-white/70 relative z-10" />
            </div>

            {/* Quote Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-foreground line-clamp-1 italic">
                &ldquo;{quoteText}&rdquo;
              </p>
              {authorName && (
                <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5 font-medium">
                  — {authorName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                  className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                    quote.isActive !== false
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                >
                  {quote.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Tabs: Assign To vs Current Assignments */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all border ${
                activeTab === 'assign'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-card text-foreground-secondary hover:text-foreground border-border hover:bg-muted/50'
              }`}
            >
              Assign To
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all border flex items-center justify-center gap-2 ${
                activeTab === 'current'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-card text-foreground-secondary hover:text-foreground border-border hover:bg-muted/50'
              }`}
            >
              <span>Current Assignments</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'current'
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-foreground-secondary'
                }`}
              >
                {currentAssignments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'assign' ? (
            <>
              {/* Target Selector: [ QR Tags ] [ Customers ] */}
              <div>
                <label className="text-xs font-semibold tracking-wider text-foreground-secondary uppercase mb-2 block">
                  Assign To
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange('tag')}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs sm:text-sm transition-all ${
                      targetType === 'tag'
                        ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                        : 'bg-card border-border text-foreground-secondary hover:bg-muted/50'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Tags</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetTypeChange('user')}
                    className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium text-xs sm:text-sm transition-all ${
                      targetType === 'user'
                        ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                        : 'bg-card border-border text-foreground-secondary hover:bg-muted/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Customers</span>
                  </button>
                </div>
              </div>

              {/* QR Tags Selection Panel */}
              {targetType === 'tag' && (
                <div className="space-y-3">
                  {/* Search and Select Available */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary/70" />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => {
                          setTagSearch(e.target.value);
                          setTagPage(1);
                        }}
                        placeholder="Search tags by code or order..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAvailable}
                      className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-card border border-border hover:bg-muted text-foreground-secondary hover:text-foreground shrink-0 transition-colors shadow-2xs"
                    >
                      Select Available
                    </button>
                  </div>

                  {/* Tags List */}
                  <div className="border border-border/80 rounded-xl divide-y divide-border/60 max-h-60 overflow-y-auto bg-card shadow-2xs">
                    {tagsLoading ? (
                      <div className="p-8 text-center text-xs text-foreground-secondary">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading assignable tags...
                      </div>
                    ) : tags.length === 0 ? (
                      <div className="p-8 text-center text-xs sm:text-sm text-foreground-secondary">
                        No tags found matching your search.
                      </div>
                    ) : (
                      tags.map((tag) => {
                        const tagId = tag._id?.toString();
                        const isAssigned = alreadyAssignedTagIds.has(tagId);
                        const isSelected = selectedItems.has(tagId);
                        const orderSummary = getOrderAndCustomerSummary(tag);
                        const currentQuote = tag.assignedQuote;

                        return (
                          <div
                            key={tagId}
                            onClick={() => {
                              if (!isAssigned) {
                                toggleItem(tagId, tag.tagCode, orderSummary);
                              }
                            }}
                            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                              isAssigned
                                ? 'bg-muted/40 opacity-60 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isAssigned}
                                onChange={() => {}}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary shrink-0 pointer-events-none"
                              />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {tag.tagCode}
                                </p>
                                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                                  {orderSummary}
                                </p>
                                {currentQuote && !isAssigned ? (
                                  <p className="text-[11px] text-amber-500/90 truncate mt-0.5">
                                    Current: "{currentQuote.text || 'Visual Quote'}" ({currentQuote.category || 'Inspire'})
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-md font-medium shrink-0 border ${
                                isAssigned
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {isAssigned ? 'Assigned' : currentQuote ? 'Override' : 'Available'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination for Tags */}
                  {tagMeta.totalPage > 1 && (
                    <div className="flex justify-between items-center text-xs text-foreground-secondary pt-1">
                      <span>
                        Page {tagMeta.page} of {tagMeta.totalPage} ({tagMeta.total} total tags)
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={tagPage <= 1}
                          onClick={() => setTagPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1 rounded-lg border border-border disabled:opacity-40 hover:bg-muted font-medium"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={tagPage >= tagMeta.totalPage}
                          onClick={() => setTagPage((p) => Math.min(tagMeta.totalPage, p + 1))}
                          className="px-3 py-1 rounded-lg border border-border disabled:opacity-40 hover:bg-muted font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customers Selection Panel */}
              {targetType === 'user' && (
                <div className="space-y-3">
                  {/* Search and Select Available */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary/70" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setUserPage(1);
                        }}
                        placeholder="Search customers by name or email..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-foreground-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAvailable}
                      className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-card border border-border hover:bg-muted text-foreground-secondary hover:text-foreground shrink-0 transition-colors shadow-2xs"
                    >
                      Select Available
                    </button>
                  </div>

                  {/* Customers List */}
                  <div className="border border-border/80 rounded-xl divide-y divide-border/60 max-h-60 overflow-y-auto bg-card shadow-2xs">
                    {usersLoading ? (
                      <div className="p-8 text-center text-xs text-foreground-secondary">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading assignable customers...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="p-8 text-center text-xs sm:text-sm text-foreground-secondary">
                        No customers found matching your search.
                      </div>
                    ) : (
                      users.map((u) => {
                        const uId = u._id?.toString();
                        const isAssigned = alreadyAssignedUserIds.has(uId);
                        const isSelected = selectedItems.has(uId);
                        const customerName = u.name || u.email?.split('@')[0] || 'Customer';

                        return (
                          <div
                            key={uId}
                            onClick={() => {
                              if (!isAssigned) {
                                toggleItem(uId, customerName, u.email);
                              }
                            }}
                            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                              isAssigned
                                ? 'bg-muted/40 opacity-60 cursor-not-allowed'
                                : 'cursor-pointer hover:bg-muted/40'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isAssigned}
                                onChange={() => {}}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary shrink-0 pointer-events-none"
                              />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {customerName}
                                </p>
                                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                                  {u.email}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-md font-medium shrink-0 border ${
                                isAssigned
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {isAssigned ? 'Assigned' : 'Available'}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination for Users */}
                  {userMeta.totalPage > 1 && (
                    <div className="flex justify-between items-center text-xs text-foreground-secondary pt-1">
                      <span>
                        Page {userMeta.page} of {userMeta.totalPage} ({userMeta.total} total customers)
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          disabled={userPage <= 1}
                          onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1 rounded-lg border border-border disabled:opacity-40 hover:bg-muted font-medium"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={userPage >= userMeta.totalPage}
                          onClick={() => setUserPage((p) => Math.min(userMeta.totalPage, p + 1))}
                          className="px-3 py-1 rounded-lg border border-border disabled:opacity-40 hover:bg-muted font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Recipients Chips Section */}
              {selectedList.length > 0 && (
                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      Selected ({selectedList.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedItems(new Map())}
                      className="text-xs text-foreground-secondary hover:text-rose-500 transition-colors font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                    {selectedList.map((item) => (
                      <div
                        key={item.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
                      >
                        <span>{item.label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="hover:bg-primary/20 rounded-md p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Current Assignments Tab */
            <div className="space-y-5">
              {assignmentsLoading ? (
                <div className="p-8 text-center text-xs text-foreground-secondary">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading current assignments...
                </div>
              ) : currentAssignments.length === 0 ? (
                <div className="p-10 text-center text-foreground-secondary border border-dashed border-border rounded-2xl">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-foreground-secondary/40" />
                  <p className="text-sm font-semibold text-foreground">No current assignments</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    This quote is not assigned to any QR Tag or customer yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* QR Tags Section */}
                  {currentTagAssignments.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-primary" />
                          <span>QR Tags ({currentTagAssignments.length})</span>
                        </h4>
                      </div>
                      <div className="border border-border/80 rounded-xl divide-y divide-border/60 bg-card overflow-hidden shadow-2xs">
                        {currentTagAssignments.map((a) => {
                          const tag = a.tag;
                          const tagCode = tag?.tagCode || 'Unknown Tag';
                          const orderSummary = getOrderAndCustomerSummary(tag);
                          const isRemoving = removingId === a._id;

                          return (
                            <div
                              key={a._id}
                              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                                  {tagCode}
                                </p>
                                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                                  {orderSummary} · Assigned {formatDate(a.createdAt)}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => handleRemoveAssignment(a._id)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isRemoving ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Remove</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Customers Section */}
                  {currentUserAssignments.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>Customers ({currentUserAssignments.length})</span>
                        </h4>
                      </div>
                      <div className="border border-border/80 rounded-xl divide-y divide-border/60 bg-card overflow-hidden shadow-2xs">
                        {currentUserAssignments.map((a) => {
                          const u = a.user;
                          const name = u?.name || u?.email?.split('@')[0] || 'Customer';
                          const isRemoving = removingId === a._id;

                          return (
                            <div
                              key={a._id}
                              className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                  {name}
                                </p>
                                <p className="text-xs text-foreground-secondary truncate mt-0.5">
                                  {u?.email} · Assigned {formatDate(a.createdAt)}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => handleRemoveAssignment(a._id)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isRemoving ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                                <span>Remove</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/20 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors"
          >
            {activeTab === 'assign' ? 'Cancel' : 'Close'}
          </button>

          {activeTab === 'assign' && (
            <button
              type="button"
              disabled={selectedList.length === 0 || isSubmitting}
              onClick={handleAssignSubmit}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Assign Quote ({selectedList.length})</span>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
