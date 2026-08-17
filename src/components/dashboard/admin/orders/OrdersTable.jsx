'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import ActionMenu from '../shared/ActionMenu';
import {
  formatStatusLabel,
  getFulfillmentStatusStyle,
  getPaymentStatusStyle,
} from '@/utils/statusFormatter';

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

function OrderRow({ order, onView, onStatus, onCancel, onDelete, onAssign }) {
  const fulfillmentStyle = getFulfillmentStatusStyle(order.fulfillmentStatus);
  const paymentStyle = getPaymentStatusStyle(order.paymentStatus);
  const productNames = order.items?.map((it) => it.product?.name).join(', ') || '—';
  const isCancelOrReturn = order.fulfillmentStatus === 'cancelled' || order.fulfillmentStatus === 'returned';

  const actions = [
    { label: 'View Details', onClick: () => onView(order) },
    { separator: true },
  ];

  if (order.tagAssignmentStatus !== 'complete' && !isCancelOrReturn) {
    actions.push({ label: 'QR Tag Assign', onClick: () => onAssign(order) });
    actions.push({ separator: true });
  }

  actions.push(
    { label: 'Update Status', onClick: () => onStatus(order), disabled: isCancelOrReturn },
    { separator: true },
    { label: 'Cancel Order', onClick: () => onCancel(order), destructive: true, disabled: isCancelOrReturn },
    { separator: true },
    { label: 'Delete Order', onClick: () => onDelete(order), destructive: true }
  );

  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate">#{idShort(order._id)}</p>
        <p className="text-[10px] text-foreground-tertiary truncate">{order.orderNumber || ''}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{order.user?.name || order.guestCustomer?.fullName || 'Guest'}</p>
        <p className="text-xs text-foreground-tertiary truncate">{order.user?.email || order.guestCustomer?.email || '—'}</p>
      </div>

      <div className="hidden md:block text-xs text-foreground-secondary truncate">{productNames}</div>

      <div className="text-sm font-semibold text-foreground">{formatPrice(order.grandTotal)}</div>

      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${paymentStyle}`}>
          {formatStatusLabel(order.paymentStatus || 'pending')}
        </span>
      </div>

      <div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
          {formatStatusLabel(order.fulfillmentStatus || 'pending')}
        </span>
      </div>

      <div className="flex justify-end">
        <ActionMenu actions={actions} />
      </div>
    </div>
  );
}

export default function OrdersTable({ orders = [], onView, onStatus, onCancel, onDelete, onAssign }) {
  if (orders.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag size={18} className="text-indigo-400" /> All Orders
          </h2>
        </div>
        <div className="hidden lg:grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
          <span>Order</span><span>Customer</span><span className="hidden md:inline">Product</span><span>Total</span><span>Payment</span><span>Status</span><span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-border/50">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
              <OrderRow order={order} onView={onView} onStatus={onStatus} onCancel={onCancel} onDelete={onDelete} onAssign={onAssign} />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
