'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight } from 'lucide-react';

const STATUS_FLOW = {
  pending: ['assigned', 'cancelled'],
  assigned: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

const STATUS_LABELS = {
  pending: 'Pending',
  assigned: 'Assigned',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export default function OrderStatusDialog({
  open,
  onOpenChange,
  order,
  onSave,
  isLoading = false,
}) {
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (order && open) {
      setStatus('');
      setReason('');
    }
  }, [order, open]);

  if (!order) return null;

  const allowedStatuses = STATUS_FLOW[order.fulfillmentStatus] || [];
  const isCancelling = status === 'cancelled';

  const handleSave = () => {
    if (!status) return;

    if (isCancelling) {
      onSave({ orderId: order._id, status: 'cancelled', reason });
    } else {
      onSave({ orderId: order._id, status, reason: '' });
    }
  };

  if (allowedStatuses.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Order is already <strong>{STATUS_LABELS[order.fulfillmentStatus]}</strong>. No further status transitions are available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
          <DialogDescription>
            Change fulfillment status for order <strong>#{order._id?.slice(-8).toUpperCase()}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current status */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-foreground-tertiary">Current:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
              {STATUS_LABELS[order.fulfillmentStatus]}
            </span>
          </div>

          {/* Status select */}
          <div className="space-y-1.5">
            <label htmlFor="new-status" className="block text-xs font-medium text-foreground-secondary">
              New Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="new-status" className="w-full h-9">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cancel reason */}
          {isCancelling && (
            <div className="space-y-1.5">
              <label htmlFor="cancel-reason" className="block text-xs font-medium text-foreground-secondary">
                Cancellation Reason
              </label>
              <Textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why the order is being cancelled..."
                rows={3}
              />
            </div>
          )}

          {/* Status transition indicator */}
          {status && (
            <div className="flex items-center gap-2 text-xs text-foreground-secondary bg-muted/30 rounded-lg px-3 py-2">
              <span>{STATUS_LABELS[order.fulfillmentStatus]}</span>
              <ArrowRight size={14} />
              <span className="font-medium text-foreground">{STATUS_LABELS[status]}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={!status || isLoading}>
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
