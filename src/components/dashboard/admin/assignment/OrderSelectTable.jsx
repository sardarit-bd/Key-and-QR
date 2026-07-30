'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const FULFILLMENT_STYLES = {
  pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  assigned:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped:    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
  returned:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OrderSelectTable({ orders = [], selectedOrderId, onSelect }) {
  if (orders.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <ShoppingBag size={16} className="text-indigo-400" />
          Select Order
          <span className="text-[10px] text-foreground-tertiary font-normal">({orders.length})</span>
        </h3>

        <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
          {orders.map((order) => {
            const isSelected = selectedOrderId === order._id;
            const style = FULFILLMENT_STYLES[order.fulfillmentStatus] || FULFILLMENT_STYLES.pending;
            const customer = order.user?.name || order.guestCustomer?.fullName || 'Guest';

            return (
              <button
                key={order._id}
                onClick={() => onSelect(order)}
                className={`w-full flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/30 border border-transparent'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{customer}</p>
 <p className="text-xs text-foreground-tertiary truncate">
                    #{order._id?.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold text-foreground">
                    ${Number(order.grandTotal).toFixed(2)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style}`}>
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
