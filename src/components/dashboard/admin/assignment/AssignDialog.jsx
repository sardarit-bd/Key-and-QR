'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, ShoppingBag, User, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { formatStatusLabel, getOrderAssignmentStatus } from '@/utils/statusFormatter';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <Icon size={14} className="text-foreground-tertiary flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function AssignDialog({
  open,
  onOpenChange,
  selectedTag,
  selectedOrder,
  onAssign,
  isLoading = false,
}) {
  const canAssign = selectedTag && selectedOrder;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-neutral-100">Confirm Tag Assignment</DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">Review details before assigning the tag.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Tag info */}
          {selectedTag ? (
            <div className="bg-amber-50/70 dark:bg-neutral-900/80 dark:bg-amber-400/[0.04] rounded-xl p-3.5 border border-[#E5C158]/50 dark:border-[#E5C378]/30">
              <p className="text-[10px] text-amber-800 dark:text-[#E5C378] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-semibold">
                <QrCode size={13} className="text-[#E5C378]" /> Tag
              </p>
              <p className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">{selectedTag.tagCode}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">ID: {selectedTag._id}</p>
            </div>
          ) : (
            <div className="text-center py-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No tag selected</p>
            </div>
          )}

          {/* Order info */}
          {selectedOrder ? (
            <div className="bg-neutral-50/70 dark:bg-neutral-800/40 rounded-xl p-3.5 border border-neutral-200 dark:border-neutral-800">
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-semibold">
                <ShoppingBag size={13} className="text-[#E5C378]" /> Order
              </p>
              <p className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                #{selectedOrder._id?.slice(-8).toUpperCase()}
              </p>
              <Row icon={User} label="Customer" value={selectedOrder.user?.name || selectedOrder.guestCustomer?.fullName || 'Guest'} />
              <Row icon={User} label="Email" value={selectedOrder.user?.email || selectedOrder.guestCustomer?.email || '—'} />
              <Row icon={ShoppingBag} label="Total" value={`$${Number(selectedOrder.grandTotal).toFixed(2)}`} />
              <Row icon={Calendar} label="Date" value={formatDate(selectedOrder.createdAt)} />
              <Row icon={ShoppingBag} label="Order Status" value={formatStatusLabel(selectedOrder.fulfillmentStatus || 'pending')} />
              <Row icon={CreditCard} label="Payment Status" value={formatStatusLabel(selectedOrder.paymentStatus || 'pending')} />
              <Row icon={QrCode} label="Assignment Status" value={formatStatusLabel(getOrderAssignmentStatus(selectedOrder, selectedTag))} />
            </div>
          ) : (
            <div className="text-center py-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No order selected</p>
            </div>
          )}
        </div>

        <DialogFooter className="w-full flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-sm transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onAssign(selectedTag, selectedOrder)}
            disabled={!canAssign || isLoading}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#E5C378] to-[#d8b564] hover:from-[#ebd292] hover:to-[#dfbe6e] text-neutral-950 font-semibold text-sm shadow-md shadow-[#E5C378]/20 border border-[#E5C378]/50 transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C378] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isLoading ? (
              'Assigning...'
            ) : (
              <>
                <CheckCircle size={15} /> Assign Tag
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
