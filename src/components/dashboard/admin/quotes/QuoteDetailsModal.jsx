'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Calendar,
  Layers,
  Activity,
  QrCode,
  Users,
  PenSquare,
  Eye,
  Link2,
  Package,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';
import Link from 'next/link';
import { getCategoryBadgeClass, getCategoryLabel } from '@/components/category';

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

export default function QuoteDetailsModal({
  open,
  onOpenChange,
  quote,
  assignments = [],
  onOpenAssign,
}) {
  if (!quote) return null;

  const quoteStyle = getQuoteCardStyle(quote);
  const quoteText = quote.text && quote.text.toLowerCase() !== 'untitled quote' ? quote.text : 'Image Quote';
  const authorName = (quote.author || '').replace(/^—\s*/, '').trim();

  const quoteId = (quote._id || quote.id)?.toString();
  const quoteAssignments = assignments.filter((a) => {
    if (a.isActive === false) return false;
    const qId = a.quote?._id?.toString() || (typeof a.quote === 'string' ? a.quote : a.quote?.toString?.());
    return qId === quoteId;
  });

  const tagAssignments = quoteAssignments.filter((a) => a.assignmentType === 'tag');
  const userAssignments = quoteAssignments.filter((a) => a.assignmentType === 'user');
  const totalRecipients = quoteAssignments.length;

  const openPreview = () => {
    window.open(`/admin/quotes/preview?id=${quote._id}&mode=desktop`, '_blank');
  };

  const handleManageClick = () => {
    onOpenChange(false);
    if (onOpenAssign) {
      onOpenAssign(quote);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[660px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 border-b border-border/60">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Quote Details & Management
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-foreground-secondary mt-1">
            Full quote preview, metadata, and assignment relationships
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Section: Artwork & Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Artwork Card */}
            <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden border border-border/80 relative shadow-sm flex items-center justify-center p-4 bg-muted/40">
              <div
                style={quoteStyle}
                className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105 duration-300"
              />
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />
              <div className="relative z-10 text-center text-white p-2">
                <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-80" />
                <p className="text-xs font-semibold line-clamp-3 italic opacity-95">
                  &ldquo;{quoteText}&rdquo;
                </p>
                {authorName && (
                  <p className="text-xs mt-1 text-white/80 font-medium truncate">
                    — {authorName}
                  </p>
                )}
              </div>
            </div>

            {/* Metadata Information */}
            <div className="sm:col-span-8 space-y-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  &ldquo;{quoteText}&rdquo;
                </h3>
                {authorName && (
                  <p className="text-sm text-foreground-secondary font-medium mt-1">
                    — {authorName}
                  </p>
                )}
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl border border-border/70 bg-muted/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary block mb-1">
                    Category
                  </span>
                  {quote.category ? (
                    <span
                      className={`inline-block text-xs px-2.5 py-0.5 rounded-md font-medium capitalize border ${getCategoryBadgeClass(
                        quote.category
                      )}`}
                    >
                      {getCategoryLabel(quote.category)}
                    </span>
                  ) : (
                    <span className="text-xs text-foreground-secondary font-medium">Uncategorized</span>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-border/70 bg-muted/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary block mb-1">
                    Status
                  </span>
                  <span
                    className={`inline-block text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                      quote.isActive !== false
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {quote.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border/70 bg-muted/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary block mb-1">
                    Created Date
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {formatDate(quote.createdAt)}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-border/70 bg-muted/20">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary block mb-1">
                    Quote ID
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate block">
                    {quote._id?.slice(-8).toUpperCase() || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Relationships Section */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                  Assignment Relationships
                </h4>
                <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                  Total recipients receiving this quote:{' '}
                  <span className="text-primary font-bold">{totalRecipients}</span>
                </p>
              </div>
            </div>

            {totalRecipients === 0 ? (
              <div className="p-6 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10">
                <Link2 className="w-6 h-6 mx-auto mb-1.5 text-foreground-secondary/40" />
                <p className="text-sm font-semibold text-foreground">No Active Assignments</p>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Click &ldquo;Manage / Assign&rdquo; below to assign this quote to QR Tags or customers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Assigned QR Tags */}
                {tagAssignments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-primary" />
                      <span>Assigned QR Tags ({tagAssignments.length})</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {tagAssignments.map((a) => {
                        const tag = a.tag;
                        const tagCode = tag?.tagCode || 'Unknown Tag';
                        const summary = getOrderAndCustomerSummary(tag);

                        return (
                          <div
                            key={a._id}
                            className="p-3 rounded-xl border border-border/80 bg-card shadow-2xs flex flex-col justify-between"
                          >
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                              {tagCode}
                            </span>
                            <span className="text-xs text-foreground-secondary truncate mt-0.5">
                              {summary}
                            </span>
                            <span className="text-xs text-foreground-secondary/70 mt-1">
                              Assigned {formatDate(a.createdAt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Assigned Customers */}
                {userAssignments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Assigned Customers ({userAssignments.length})</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {userAssignments.map((a) => {
                        const u = a.user;
                        const name = u?.name || u?.email?.split('@')[0] || 'Customer';

                        return (
                          <div
                            key={a._id}
                            className="p-3 rounded-xl border border-border/80 bg-card shadow-2xs flex flex-col justify-between"
                          >
                            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                              {name}
                            </span>
                            <span className="text-xs text-foreground-secondary truncate mt-0.5">
                              {u?.email}
                            </span>
                            <span className="text-xs text-foreground-secondary/70 mt-1">
                              Assigned {formatDate(a.createdAt)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/20 flex items-center justify-between flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPreview}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <Link
              href={`/new-dashboard/admin/quotes/${quote._id}/edit-visual`}
              className="px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              <span>Edit Visual</span>
            </Link>

            <button
              type="button"
              onClick={handleManageClick}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-sm transition-all flex items-center gap-1.5"
            >
              <Link2 className="w-4 h-4" />
              <span>Manage / Assign</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
