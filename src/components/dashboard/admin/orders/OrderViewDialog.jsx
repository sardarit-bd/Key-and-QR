'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Package,
  Clock,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FULFILLMENT_STYLES = {
  pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  assigned:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
  returned:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const PAYMENT_STYLES = {
  paid:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  refunded:  'bg-red-500/10 text-red-400 border-red-500/20',
  failed:    'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

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

export default function OrderViewDialog({ open, onOpenChange, order, isLoading = false }) {
  const fulfillmentStyle = FULFILLMENT_STYLES[order?.fulfillmentStatus] || '';
  const paymentStyle = PAYMENT_STYLES[order?.paymentStatus] || '';
  const tagStatusStyle = TAG_STATUS_STYLES[order?.tagAssignmentStatus] || TAG_STATUS_STYLES.none;

  const isCancelledOrReturned = order?.fulfillmentStatus === 'cancelled' || order?.fulfillmentStatus === 'returned';
  const assignedTag = order?.assignedTags?.[0]?.tag;
  const assignedBy = order?.assignedTags?.[0]?.assignedBy;
  const assignedAt = order?.assignedTags?.[0]?.assignedAt;

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
        ) : order ? (
          <div className="py-2 space-y-4">
            {/* Order identity */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground-tertiary">#{order._id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm font-semibold text-foreground">{order.orderNumber || ''}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
                {order.fulfillmentStatus}
              </span>
            </div>

            {/* QR Tag Assignment — display only */}
            {!isCancelledOrReturned && (
              <Section icon={QrCode} title="QR Tag Assignment">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground-tertiary">Status</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStatusStyle}`}>
                    {order.tagAssignmentStatus === 'pending_assignment' ? 'Pending QR Assignment'
                      : order.tagAssignmentStatus === 'complete' ? 'Assigned'
                      : order.tagAssignmentStatus === 'partial' ? 'Partial'
                      : 'No Tag'}
                  </span>
                </div>

                {assignedTag ? (
                  <div className="bg-muted/30 rounded-lg p-2.5 mb-2">
                    <p className="text-sm font-medium text-foreground">{assignedTag.tagCode}</p>
                    {assignedBy && <p className="text-[10px] text-foreground-tertiary">Assigned by: {assignedBy}</p>}
                    {assignedAt && <p className="text-[10px] text-foreground-tertiary">{formatDate(assignedAt)}</p>}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-tertiary mb-2">No tag assigned</p>
                )}

                <Link
                  href="/new-dashboard/admin/orders/qr-assignment"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium mt-1 transition-colors"
                >
                  <ExternalLink size={12} />
                  Manage QR Assignment
                </Link>
              </Section>
            )}

            {/* Customer Information */}
            <Section icon={User} title="Customer">
              <Row label="Name" value={order.user?.name || order.guestCustomer?.fullName || 'Guest'} />
              <Row label="Email" value={order.user?.email || order.guestCustomer?.email || '—'} />
              <Row label="Type" value={order.isGuestOrder ? 'Guest' : 'Registered'} />
            </Section>

            {/* Shipping Address */}
            <Section icon={MapPin} title="Shipping">
              {order.shippingAddress ? (
                <>
                  <Row label="Address" value={order.shippingAddress.address || '—'} />
                  <Row label="City" value={`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`} />
                  <Row label="ZIP" value={order.shippingAddress.postalCode || '—'} />
                </>
              ) : (
                <p className="text-xs text-foreground-tertiary">No shipping address</p>
              )}
            </Section>

            {/* Ordered Products */}
            <Section icon={Package} title="Products">
              {order.items?.map((item, idx) => (
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
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.shippingCost > 0 && <Row label="Shipping" value={formatPrice(order.shippingCost)} />}
              {order.discount > 0 && <Row label="Discount" value={`-${formatPrice(order.discount)}`} className="text-emerald-400" />}
              <Row label="Total" value={formatPrice(order.grandTotal)} className="text-base font-bold text-foreground" />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-foreground-tertiary">Payment Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${paymentStyle}`}>{order.paymentStatus}</span>
              </div>
            </Section>

            {/* Timeline */}
            <Section icon={Clock} title="Timeline">
              <Row label="Created" value={formatDate(order.createdAt)} />
              {order.deliveredAt && <Row label="Delivered" value={formatDate(order.deliveredAt)} />}
              {order.cancellationReason && <Row label="Cancel reason" value={order.cancellationReason} className="text-amber-400" />}
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
