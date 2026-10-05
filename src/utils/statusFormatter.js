/**
 * Status Formatting Utilities
 *
 * Centralized helpers for formatting order fulfillment and payment status strings
 * into clean, capitalized, human-readable labels and badge styles.
 */

/**
 * Format raw status strings into capitalized human-readable labels.
 * E.g.:
 * - 'pending' -> 'Pending'
 * - 'paid' -> 'Paid'
 * - 'awaiting_payment' -> 'Awaiting Payment'
 * - 'partial_refunded' -> 'Partial Refunded'
 * - 'payment_failed' -> 'Payment Failed'
 * - 'in_progress' -> 'In Progress'
 */
export function formatStatusLabel(status) {
  if (!status || typeof status !== 'string') return '—';
  return status
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const FULFILLMENT_STATUS_STYLES = {
  pending: 'bg-[#E5C378]/10 text-amber-800 dark:text-[#E5C378] border-[#E5C378]/25',
  assigned: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
  shipped: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
  delivered: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
  returned: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
};

export const PAYMENT_STATUS_STYLES = {
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  succeeded: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  pending: 'bg-[#E5C378]/10 text-amber-800 dark:text-[#E5C378] border-[#E5C378]/25',
  processing: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
  refunded: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
  partial_refunded: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
  failed: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25',
  cancelled: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  abandoned: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
};

export const ASSIGNMENT_STATUS_STYLES = {
  assigned: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
  complete: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
  unassigned: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  none: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  pending_assignment: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  partial: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
};

export function getFulfillmentStatusStyle(status) {
  const key = String(status || '').toLowerCase();
  return FULFILLMENT_STATUS_STYLES[key] || 'bg-muted text-foreground-secondary border-border';
}

export function getPaymentStatusStyle(status) {
  const key = String(status || '').toLowerCase();
  return PAYMENT_STATUS_STYLES[key] || 'bg-muted text-foreground-secondary border-border';
}

export function getAssignmentStatusStyle(status) {
  const key = String(status || '').toLowerCase();
  return ASSIGNMENT_STATUS_STYLES[key] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

/**
 * Determine canonical assignment status for an order, optionally checking a selected tag.
 */
export function getOrderAssignmentStatus(order, selectedTag = null) {
  if (!order) return 'unassigned';

  // 1. If a specific tag is selected, check if this tag is already on the order
  if (selectedTag?._id) {
    const isTagOnOrder =
      order.assignedTag?._id === selectedTag._id ||
      order.assignedTag === selectedTag._id ||
      order.assignedTags?.some((t) => (t.tag?._id || t.tag || t) === selectedTag._id) ||
      order.items?.some((it) => it.assignedTags?.some((t) => (t?._id || t) === selectedTag._id));

    if (isTagOnOrder) return 'assigned';
  }

  // 2. Check if the order itself has completed or attached tags
  if (
    order.tagAssignmentStatus === 'complete' ||
    (order.assignedTags && order.assignedTags.length > 0) ||
    order.assignedTag
  ) {
    return 'assigned';
  }

  return 'unassigned';
}
