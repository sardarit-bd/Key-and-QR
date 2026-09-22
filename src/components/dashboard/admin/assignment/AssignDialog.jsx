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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Tag Assignment</DialogTitle>
          <DialogDescription>Review details before assigning the tag.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Tag info */}
          {selectedTag ? (
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/15">
              <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <QrCode size={12} /> Tag
              </p>
              <p className="text-base font-bold text-foreground">{selectedTag.tagCode}</p>
              <p className="text-xs text-foreground-tertiary">ID: {selectedTag._id}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-foreground-tertiary">No tag selected</p>
            </div>
          )}

          {/* Order info */}
          {selectedOrder ? (
            <div className="bg-card rounded-xl p-3 border border-border">
              <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShoppingBag size={12} /> Order
              </p>
              <p className="text-sm font-medium text-foreground">
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
            <div className="text-center py-4">
              <p className="text-sm text-foreground-tertiary">No order selected</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-10 px-4 rounded-lg border border-[#2A2D35] bg-transparent text-[#9BA1AD] hover:bg-[#24272D] hover:text-white font-medium text-sm transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onAssign(selectedTag, selectedOrder)}
            disabled={!canAssign || isLoading}
            className="h-10 px-5 rounded-lg bg-[#1E2025] hover:bg-[#282B32] text-white border border-[#323640] font-medium text-sm shadow-sm transition-all cursor-pointer select-none flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-50"
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
