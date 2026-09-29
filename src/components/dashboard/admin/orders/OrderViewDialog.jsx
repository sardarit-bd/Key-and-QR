'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Package,
  Clock,
  QrCode,
  Gift,
  Sparkles,
  MessageSquareHeart,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatStatusLabel,
  getFulfillmentStatusStyle,
  getPaymentStatusStyle,
} from '@/utils/statusFormatter';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import toast from 'react-hot-toast';

const TAG_STATUS_STYLES = {
  complete:           'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending_assignment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  partial:            'bg-blue-500/10 text-blue-400 border-blue-500/20',
  none:               'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="border-b border-border/50 pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
      <h3 className="text-[11px] text-foreground-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5 mb-2">
        <Icon size={13} /> {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value, className = '' }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-foreground-tertiary">{label}</span>
      <span className={`text-xs text-foreground font-medium text-right ${className}`}>{value}</span>
    </div>
  );
}

export default function OrderViewDialog({ open, onOpenChange, order, isLoading = false, onOrderUpdated }) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  const fulfillmentStyle = getFulfillmentStatusStyle(currentOrder?.fulfillmentStatus);
  const paymentStyle = getPaymentStatusStyle(currentOrder?.paymentStatus);
  const tagStatusStyle = TAG_STATUS_STYLES[currentOrder?.tagAssignmentStatus] || TAG_STATUS_STYLES.none;

  const isCancelledOrReturned = currentOrder?.fulfillmentStatus === 'cancelled' || currentOrder?.fulfillmentStatus === 'returned';
  const assignedTagsList = currentOrder?.assignedTags?.length > 0
    ? currentOrder.assignedTags
    : currentOrder?.assignedTag
      ? [{ tag: currentOrder.assignedTag, assignedAt: currentOrder.updatedAt, assignedBy: 'admin' }]
      : [];

  const giftMessageText = currentOrder?.giftMessage || currentOrder?.items?.find((i) => i.giftMessage)?.giftMessage;
  const isGiftOrder = currentOrder?.purchaseType === 'gift' || Boolean(giftMessageText);
  const giftMessageStatus = currentOrder?.giftMessageStatus || (giftMessageText ? 'pending' : 'none');

  const handleApproveMessage = async () => {
    if (!currentOrder?._id || moderating) return;
    setModerating(true);
    try {
      await adminOrdersService.approveGiftMessage(currentOrder._id);
      toast.success('Gift message approved');
      const updated = {
        ...currentOrder,
        giftMessageStatus: 'approved',
        giftMessageReviewedAt: new Date().toISOString(),
      };
      setCurrentOrder(updated);
      onOrderUpdated?.(updated);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve gift message');
    } finally {
      setModerating(false);
    }
  };

  const handleRejectMessage = async () => {
    if (!currentOrder?._id || moderating) return;
    setModerating(true);
    try {
      await adminOrdersService.rejectGiftMessage(currentOrder._id);
      toast.success('Gift message rejected');
      const updated = {
        ...currentOrder,
        giftMessageStatus: 'rejected',
        giftMessageReviewedAt: new Date().toISOString(),
      };
      setCurrentOrder(updated);
      onOrderUpdated?.(updated);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject gift message');
    } finally {
      setModerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : currentOrder ? (
          <div className="py-2 space-y-4">
            {/* Order identity */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground-tertiary">#{currentOrder._id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-semibold text-foreground">{currentOrder.orderNumber || ''}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
                {formatStatusLabel(currentOrder.fulfillmentStatus || 'pending')}
              </span>
            </div>

            {/* QR Tag Assignment — display only */}
            {!isCancelledOrReturned && (
              <Section icon={QrCode} title="QR Tag Assignment">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground-tertiary">Status</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStatusStyle}`}>
                    {currentOrder.tagAssignmentStatus === 'pending_assignment' ? 'Pending QR Assignment'
                      : currentOrder.tagAssignmentStatus === 'complete' ? 'Assigned'
                      : currentOrder.tagAssignmentStatus === 'partial' ? 'Partial'
                      : 'No Tag'}
                  </span>
                </div>

                {assignedTagsList.length > 0 ? (
                  <div className="space-y-2 mb-2">
                    {assignedTagsList.map((item, idx) => {
                      const tagObj = item.tag?._id ? item.tag : item.tag;
                      const tagCode = tagObj?.tagCode || (typeof tagObj === 'string' ? tagObj : currentOrder?.assignedTag?.tagCode || 'Tag');
                      return (
                        <div key={idx} className="bg-muted/30 rounded-lg p-2.5">
                          <p className="text-sm font-medium text-foreground">{tagCode}</p>
                          {item.assignedBy && <p className="text-[10px] text-foreground-tertiary">Assigned by: {item.assignedBy}</p>}
                          {item.assignedAt && <p className="text-[10px] text-foreground-tertiary">{formatDate(item.assignedAt)}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-tertiary mb-2">No tag assigned</p>
                )}
              </Section>
            )}

            {/* Gift Message Details */}
            {isGiftOrder && (
              <Section icon={Gift} title="Gift Information & Message">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-tertiary">Moderation Status</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        giftMessageStatus === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : giftMessageStatus === 'rejected'
                          ? 'bg-red-500/10 text-red-500 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}
                    >
                      {giftMessageStatus === 'approved'
                        ? 'Approved'
                        : giftMessageStatus === 'rejected'
                        ? 'Rejected'
                        : 'Pending Approval'}
                    </span>
                  </div>

                  {giftMessageText ? (
                    <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                        <MessageSquareHeart size={14} />
                        Customer Gift Dedication
                      </div>
                      <p className="italic text-sm text-foreground leading-relaxed">
                        &ldquo;{giftMessageText}&rdquo;
                      </p>
                      {currentOrder?.giftMessageReviewedAt && (
                        <p className="text-[10px] text-foreground-tertiary pt-1 border-t border-purple-500/10">
                          Reviewed: {formatDate(currentOrder.giftMessageReviewedAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-tertiary italic">
                      Marked as a gift, but no custom dedication provided.
                    </p>
                  )}

                  {/* Moderation actions for pending gift messages */}
                  {giftMessageText && giftMessageStatus === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleApproveMessage}
                        disabled={moderating}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {moderating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Approve Message
                      </button>
                      <button
                        type="button"
                        onClick={handleRejectMessage}
                        disabled={moderating}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2 px-3 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {moderating ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                        Reject Message
                      </button>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Customer Information */}
            <Section icon={User} title="Customer">
              <Row label="Name" value={currentOrder.user?.name || currentOrder.guestCustomer?.fullName || 'Guest'} />
              <Row label="Email" value={currentOrder.user?.email || currentOrder.guestCustomer?.email || '—'} />
              <Row label="Type" value={currentOrder.isGuestOrder ? 'Guest' : 'Registered'} />
            </Section>

            {/* Shipping Address */}
            <Section icon={MapPin} title="Shipping">
              {currentOrder.shippingAddress ? (
                <>
                  {currentOrder.shippingAddress.fullName && <Row label="Recipient" value={currentOrder.shippingAddress.fullName} />}
                  {currentOrder.shippingAddress.phone && <Row label="Phone" value={currentOrder.shippingAddress.phone} />}
                  <Row label="Address" value={currentOrder.shippingAddress.address || '—'} />
                  <Row label="City / State" value={[currentOrder.shippingAddress.city, currentOrder.shippingAddress.state].filter(Boolean).join(', ') || '—'} />
                  <Row label="ZIP" value={currentOrder.shippingAddress.postalCode || '—'} />
                  {currentOrder.shippingAddress.country && <Row label="Country" value={currentOrder.shippingAddress.country} />}
                </>
              ) : (
                <p className="text-xs text-foreground-tertiary">No shipping address</p>
              )}
            </Section>

            {/* Ordered Products */}
            <Section icon={Package} title="Products">
              {currentOrder.items?.map((item, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-2.5 mb-2 last:mb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.product?.name || 'Product'}</p>
                    <p className="text-sm font-semibold text-foreground">{formatPrice(item.subtotal)}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-foreground-tertiary">
                    <span>Qty: {item.quantity}</span>
                    <span>× {formatPrice(item.unitPrice)}</span>
                    <span className={`capitalize ${item.purchaseType === 'gift' ? 'text-purple-400' : ''}`}>
                      {item.purchaseType}
                    </span>
                  </div>
                  {item.giftMessage && (
                    <p className="text-[11px] text-foreground-tertiary mt-1 italic">
                      &ldquo;{item.giftMessage}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </Section>

            {/* Pricing Summary */}
            <Section icon={CreditCard} title="Payment">
              <Row label="Subtotal" value={formatPrice(currentOrder.subtotal)} />
              {currentOrder.shippingCost > 0 && <Row label="Shipping" value={formatPrice(currentOrder.shippingCost)} />}
              {currentOrder.discount > 0 && <Row label="Discount" value={`-${formatPrice(currentOrder.discount)}`} className="text-emerald-400" />}
              <Row label="Total" value={formatPrice(currentOrder.grandTotal)} className="text-base font-bold text-foreground" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-foreground-tertiary">Payment Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${paymentStyle}`}>
                  {formatStatusLabel(currentOrder.paymentStatus || 'pending')}
                </span>
              </div>
            </Section>

            {/* Timeline */}
            <Section icon={Clock} title="Timeline">
              <Row label="Created" value={formatDate(currentOrder.createdAt)} />
              {currentOrder.deliveredAt && <Row label="Delivered" value={formatDate(currentOrder.deliveredAt)} />}
              {currentOrder.cancellationReason && <Row label="Cancel reason" value={currentOrder.cancellationReason} className="text-amber-400" />}
            </Section>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">Order not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
