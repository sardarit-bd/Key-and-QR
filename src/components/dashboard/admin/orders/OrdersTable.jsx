'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';

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

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function idShort(id) {
  return id?.slice(-8).toUpperCase() || '—';
}

function OrderRow({ order, onView, onStatus, onCancel, onDelete }) {
  const fulfillmentStyle = FULFILLMENT_STYLES[order.fulfillmentStatus] || FULFILLMENT_STYLES.pending;
  const paymentStyle = PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.pending;
  const productNames = order.items?.map((it) => it.product?.name).join(', ') || '—';
  const isCancelOrReturn = order.fulfillmentStatus === 'cancelled' || order.fulfillmentStatus === 'returned';

  const actions = [
    { label: 'View Details', onClick: () => onView(order) },
    { separator: true },
    { label: 'Update Status', onClick: () => onStatus(order), disabled: isCancelOrReturn },
    { separator: true },
    { label: 'Cancel Order', onClick: () => onCancel(order), destructive: true, disabled: isCancelOrReturn },
    { separator: true },
    { label: 'Delete Order', onClick: () => onDelete(order), destructive: true },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      {/* Order ID */}
      <div className="min-w-0">
        <p className="text-xs font-mono font-medium text-foreground truncate">#{idShort(order._id)}</p>
        <p className="text-[10px] text-foreground-tertiary font-mono truncate">{order.orderNumber || ''}</p>
      </div>

      {/* Customer */}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{order.user?.name || order.guestCustomer?.fullName || 'Guest'}</p>
        <p className="text-xs text-foreground-tertiary truncate">{order.user?.email || order.guestCustomer?.email || '—'}</p>
      </div>

      {/* Product(s) */}
 <div className="hidden md:block text-xs text-foreground-secondary truncate">{productNames}</div>

      {/* Total */}
      <div className="text-sm font-semibold text-foreground">{formatPrice(order.grandTotal)}</div>

      {/* Payment status */}
      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${paymentStyle}`}>
          {order.paymentStatus}
        </span>
      </div>

      {/* Fulfillment status */}
      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
          {order.fulfillmentStatus}
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function OrdersTable({ orders = [], onView, onStatus, onCancel, onDelete }) {
  if (orders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag size={18} className="text-indigo-400" />
            All Orders
          </h2>
        </div>

        {/* Column labels */}
        <div className="hidden lg:grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Order</span>
          <span>Customer</span>
          <span className="hidden md:inline">Product</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <OrderRow order={order} onView={onView} onStatus={onStatus} onCancel={onCancel} onDelete={onDelete} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
