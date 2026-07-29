'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Package } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

const STATUS_STYLES = {
  paid:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending:    'bg-amber-500/10  text-amber-400  border-amber-500/20',
  refunded:   'bg-red-500/10    text-red-400    border-red-500/20',
  cancelled:  'bg-slate-500/10  text-slate-400  border-slate-500/20',
};

const FULFILLMENT_STYLES = {
  pending:   'text-amber-400',
  assigned:  'text-blue-400',
  shipped:   'text-indigo-400',
  delivered: 'text-emerald-400',
};

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function OrderRow({ order }) {
  const idSuffix = order._id?.slice(-8).toUpperCase() || '—';
  const payment = STATUS_STYLES[order.paymentStatus] || STATUS_STYLES.pending;

  return (
    <div className="flex items-center justify-between py-3 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={16} className="text-foreground-tertiary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {order.user?.name || order.user?.email || 'Guest'}
          </p>
 <p className="text-xs text-foreground-tertiary ">
            #{idSuffix} · {order.product?.name || 'Order'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-semibold text-foreground">
          {formatPrice(order.total)}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${payment}`}>
          {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
        </span>
      </div>
    </div>
  );
}

export default function AdminRecentOrders({ orders = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Package size={18} className="text-indigo-400" />
            Recent Orders
          </h2>
          <Link
            href="/new-dashboard/admin/orders"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View All <Eye size={13} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={36} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground-tertiary">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {orders.map((order) => (
              <OrderRow key={order._id} order={order} />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
