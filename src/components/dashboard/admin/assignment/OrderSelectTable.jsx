'use client';

import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import {
  formatStatusLabel,
  getFulfillmentStatusStyle,
  getPaymentStatusStyle,
  getAssignmentStatusStyle,
  getOrderAssignmentStatus,
} from '@/utils/statusFormatter';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OrderSelectTable({ orders = [], selectedOrderId, selectedTag = null, onSelect }) {
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
            const fulfillmentStyle = getFulfillmentStatusStyle(order.fulfillmentStatus);
            const paymentStyle = getPaymentStatusStyle(order.paymentStatus);
            const assignmentStatus = getOrderAssignmentStatus(order, selectedTag);
            const assignmentStyle = getAssignmentStatusStyle(assignmentStatus);
            const customer = order.user?.name || order.guestCustomer?.fullName || 'Guest';

            return (
              <button
                key={order._id}
                onClick={() => onSelect(order)}
                className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 px-3 rounded-xl transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-2 border-primary shadow-xs'
                    : 'hover:bg-muted/40 border border-border/60 bg-card/40'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{customer}</p>
                  <p className="text-xs text-foreground-tertiary truncate mt-0.5">
                    #{order._id?.slice(-8).toUpperCase()} · {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center sm:items-end justify-between sm:justify-center sm:flex-col gap-1.5 flex-shrink-0">
                  <span className="text-sm font-semibold text-foreground">
                    ${Number(order.grandTotal).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
                      Order: {formatStatusLabel(order.fulfillmentStatus || 'pending')}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${paymentStyle}`}>
                      Payment: {formatStatusLabel(order.paymentStatus || 'pending')}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${assignmentStyle}`}>
                      Assignment: {formatStatusLabel(assignmentStatus)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

