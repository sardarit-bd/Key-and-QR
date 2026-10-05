'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
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
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 shadow-xs">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3.5">
          <ShoppingBag size={16} className="text-[#E5C378] shrink-0" />
          <span>Select Order</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal">({orders.length})</span>
        </h3>

        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
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
                type="button"
                onClick={() => onSelect(order)}
                className={`relative group w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl text-left cursor-pointer transition-all duration-200 select-none ${
                  isSelected
                    ? 'bg-amber-50/70 dark:bg-neutral-900/80 dark:bg-amber-400/[0.04] border-2 border-[#E5C158]/50 dark:border-[#E5C378]/50 shadow-sm ring-1 ring-[#E5C378]/25'
                    : 'bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {/* Left: Radio checkmark + Order & Customer Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E5C378]/15 border border-[#E5C378]/40 text-[#E5C378] shadow-xs">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-400 dark:group-hover:border-neutral-600 transition-colors" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${
                      isSelected
                        ? 'text-amber-800 dark:text-[#E5C378]'
                        : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {customer}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      <span className="font-mono font-medium">#{order._id?.slice(-8).toUpperCase()}</span>
                      <span className="mx-1.5 opacity-60">·</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Badges */}
                <div className="flex items-center sm:items-end justify-between sm:justify-center sm:flex-col gap-1.5 flex-shrink-0 pl-8 sm:pl-0">
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    ${Number(order.grandTotal).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${fulfillmentStyle}`}>
                      {formatStatusLabel(order.fulfillmentStatus || 'pending')}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${paymentStyle}`}>
                      {formatStatusLabel(order.paymentStatus || 'pending')}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${assignmentStyle}`}>
                      {formatStatusLabel(assignmentStatus)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
