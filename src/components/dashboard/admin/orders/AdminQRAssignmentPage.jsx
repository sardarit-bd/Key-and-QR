'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { QrCode, Eye, RefreshCw, Trash2, Plus } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { useAdminOrders } from '@/hooks/dashboard/useAdminOrders';
import { useQueryClient } from '@tanstack/react-query';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import Pagination from '@/components/ui/Pagination';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OrderViewDialog from './OrderViewDialog';
import AssignTagModal from './AssignTagModal';
import ConfirmDialog from '../shared/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

const TAG_STATUS_STYLES = {
  complete:           'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending_assignment: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  partial:            'bg-blue-500/10 text-blue-400 border-blue-500/20',
  none:               'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

export default function AdminQRAssignmentPage() {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [viewOrder, setViewOrder] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOrder, setRemoveOrder] = useState(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const queryClient = useQueryClient();
  const filters = {
    search: debouncedSearch,
    tagAssignmentStatus: tagFilter === 'all' ? '' : tagFilter,
    page,
    limit: ITEMS_PER_PAGE,
  };
  const { data, isLoading, isError, error, refetch } = useAdminOrders(filters);

  const orders = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleTagFilterChange = useCallback((v) => { setTagFilter(v); setPage(1); }, []);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
  };

  const handleAssign = useCallback(async (tagId) => {
    if (!assignOrder) return;
    setActionLoading(true);
    try {
      await adminOrdersService.addTagToOrder({ orderId: assignOrder._id, tagId });
      toast.success('Tag assigned successfully');
      setAssignOpen(false);
      setAssignOrder(null);
      invalidate();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign tag');
    } finally {
      setActionLoading(false);
    }
  }, [assignOrder, queryClient]);

  const handleReplace = useCallback(async (newTagId) => {
    if (!assignOrder?.assignedTags?.[0]?.tag?._id) return;
    setActionLoading(true);
    try {
      await adminOrdersService.replaceOrderTag({
        orderId: assignOrder._id,
        oldTagId: assignOrder.assignedTags[0].tag._id,
        newTagId,
      });
      toast.success('Tag replaced successfully');
      setAssignOpen(false);
      setAssignOrder(null);
      invalidate();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to replace tag');
    } finally {
      setActionLoading(false);
    }
  }, [assignOrder, queryClient]);

  const handleOpenAssign = useCallback((order) => {
    setAssignOrder(order);
    setAssignOpen(true);
  }, []);

  const handleOpenReplace = useCallback((order) => {
    setAssignOrder(order);
    setAssignOpen(true);
  }, []);

  const handleOpenRemove = useCallback((order) => {
    setRemoveOrder(order);
    setRemoveOpen(true);
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeOrder?.assignedTags?.[0]?.tag?._id) return;
    setActionLoading(true);
    try {
      await adminOrdersService.removeTagFromOrder({
        orderId: removeOrder._id,
        tagId: removeOrder.assignedTags[0].tag._id,
      });
      toast.success('Tag removed from order');
      setRemoveOpen(false);
      setRemoveOrder(null);
      invalidate();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to remove tag');
    } finally {
      setActionLoading(false);
    }
  }, [removeOrder, queryClient]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError && orders.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <QrCode size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load QR assignments</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <QrCode size={20} className="text-emerald-400" />
          </span>
          QR Assignment
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          Manage QR tag assignments for all orders.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by order ID, customer, or product..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={tagFilter} onValueChange={handleTagFilterChange}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="complete">QR Assigned</SelectItem>
            <SelectItem value="pending_assignment">Pending Assignment</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="none">No Tag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">{meta.total} orders</p>

      {!isLoading && orders.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <QrCode size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No orders found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {orders.length > 0 && (
        <div className="hidden lg:block">
          <Card className="p-4 sm:p-5 md:p-6">
            <div className="hidden lg:grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 px-2 pb-2 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-border/50 mb-1">
              <span>Order</span>
              <span>Customer</span>
              <span>QR Tag</span>
              <span>Status</span>
              <span className="hidden md:inline">Assigned</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border/50">
              {orders.map((order, i) => {
                const tagStatus = order.tagAssignmentStatus || 'none';
                const tagStyle = TAG_STATUS_STYLES[tagStatus] || TAG_STATUS_STYLES.none;
                const tag = order.assignedTags?.[0]?.tag;
                const assignedAt = order.assignedTags?.[0]?.assignedAt;
                const assignedBy = order.assignedTags?.[0]?.assignedBy;
                const productNames = order.items?.map((it) => it.product?.name).join(', ') || '—';

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,36px)] items-center gap-2 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">#{order._id?.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-foreground-tertiary truncate">{order.orderNumber || ''}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{order.user?.name || order.guestCustomer?.fullName || 'Guest'}</p>
                      <p className="text-[10px] text-foreground-tertiary truncate">{productNames}</p>
                    </div>
                    <div className="min-w-0">
                      {tag ? (
                        <p className="text-sm font-medium text-foreground truncate">{tag.tagCode}</p>
                      ) : (
                        <p className="text-xs text-foreground-tertiary">—</p>
                      )}
                    </div>
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStyle}`}>
                        {tagStatus === 'pending_assignment' ? 'Pending'
                          : tagStatus === 'complete' ? 'Assigned'
                          : tagStatus === 'partial' ? 'Partial'
                          : 'None'}
                      </span>
                    </div>
                    <div className="hidden md:block text-[10px] text-foreground-tertiary">
                      {assignedAt ? formatDate(assignedAt) : '—'}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewOrder(order)}
                        className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={13} className="text-primary" />
                      </button>
                      {tag ? (
                        <>
                          <button
                            onClick={() => handleOpenReplace(order)}
                            className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-colors cursor-pointer"
                            title="Replace Tag"
                          >
                            <RefreshCw size={12} className="text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleOpenRemove(order)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
                            title="Remove Tag"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenAssign(order)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          title="Assign Tag"
                        >
                          <Plus size={12} className="text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Mobile cards */}
      {orders.length > 0 && (
        <div className="lg:hidden space-y-3">
          {orders.map((order) => {
            const tagStatus = order.tagAssignmentStatus || 'none';
            const tagStyle = TAG_STATUS_STYLES[tagStatus] || TAG_STATUS_STYLES.none;
            const tag = order.assignedTags?.[0]?.tag;
            const productNames = order.items?.map((it) => it.product?.name).join(', ') || '—';

            return (
              <Card key={order._id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-foreground-tertiary">{order.user?.name || order.guestCustomer?.fullName || 'Guest'}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tagStyle}`}>
                    {tagStatus === 'pending_assignment' ? 'Pending' : tagStatus === 'complete' ? 'Assigned' : tagStatus}
                  </span>
                </div>
                <p className="text-xs text-foreground-tertiary mb-2">{productNames}</p>
                {tag && <p className="text-xs font-medium text-foreground mb-2">Tag: {tag.tagCode}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewOrder(order)} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/20 transition-colors cursor-pointer">View</button>
                  {tag ? (
                    <>
                      <button onClick={() => handleOpenReplace(order)} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer">Replace</button>
                      <button onClick={() => handleOpenRemove(order)} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">Remove</button>
                    </>
                  ) : (
                    <button onClick={() => handleOpenAssign(order)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">Assign</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      <OrderViewDialog open={!!viewOrder} onOpenChange={(o) => { if (!o) setViewOrder(null); }} order={viewOrder} />

      <AssignTagModal
        open={assignOpen}
        onOpenChange={(o) => { if (!o) { setAssignOpen(false); setAssignOrder(null); } }}
        onAssign={assignOrder?.assignedTags?.[0]?.tag ? handleReplace : handleAssign}
      />

      <ConfirmDialog
        open={removeOpen}
        onOpenChange={(o) => { if (!o) { setRemoveOpen(false); setRemoveOrder(null); } }}
        variant="delete"
        userName={`tag ${removeOrder?.assignedTags?.[0]?.tag?.tagCode || ''}`}
        onConfirm={handleRemoveConfirm}
        isLoading={actionLoading}
      />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' } }} />
    </div>
  );
}
