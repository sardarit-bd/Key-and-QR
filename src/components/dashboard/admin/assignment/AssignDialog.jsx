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
import { QrCode, ShoppingBag, User, Calendar, CheckCircle } from 'lucide-react';

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
            <div className="bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/10">
              <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <QrCode size={12} /> Tag
              </p>
              <p className="text-base font-mono font-bold text-foreground">{selectedTag.tagCode}</p>
              <p className="text-xs text-foreground-tertiary">ID: {selectedTag._id}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-foreground-tertiary">No tag selected</p>
            </div>
          )}

          {/* Order info */}
          {selectedOrder ? (
            <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
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
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-foreground-tertiary">No order selected</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={() => onAssign(selectedTag, selectedOrder)} disabled={!canAssign || isLoading}>
            {isLoading ? 'Assigning...' : (
              <><CheckCircle size={15} className="mr-1.5" /> Assign Tag</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
