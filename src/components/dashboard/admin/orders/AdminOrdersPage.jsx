'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useAdminOrders,
  useAdminOrdersStats,
  useAdminOrderActions,
} from '@/hooks/dashboard/useAdminOrders';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import OrdersStatsCards from './OrdersStatsCards';
import OrdersFilters from './OrdersFilters';
import OrdersTable from './OrdersTable';
import OrderMobileCards from './OrderMobileCards';
import OrderViewDialog from './OrderViewDialog';
import OrderStatusDialog from './OrderStatusDialog';
import OrderCreateDialog from './OrderCreateDialog';
import AssignTagModal from './AssignTagModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage({
  title = 'Orders Management',
  description = 'View, manage, and fulfill all platform orders.',
  defaultTagAssignment = 'all',
  defaultFulfillment = 'all',
}) {
  const [search, setSearch] = useState('');
  const [fulfillmentStatus, setFulfillmentStatus] = useState(defaultFulfillment);
  const [tagAssignmentStatus, setTagAssignmentStatus] = useState(defaultTagAssignment);
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [viewOrder, setViewOrder] = useState(null);
  const [statusOrder, setStatusOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Manual Order Creation
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Tag Assignment
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignOrder, setAssignOrder] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('delete');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filters = { search: debouncedSearch, fulfillmentStatus, tagAssignmentStatus, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminOrders(filters);
  const { data: statsData } = useAdminOrdersStats();
  const { updateFulfillmentStatus, cancelOrder, deleteOrder, createManualOrder } = useAdminOrderActions();

  const orders = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const isProcessing = updateFulfillmentStatus.isPending || cancelOrder.isPending || deleteOrder.isPending;

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleFulfillmentChange = useCallback((v) => { setFulfillmentStatus(v); setPage(1); }, []);
  const handleTagAssignmentChange = useCallback((v) => { setTagAssignmentStatus(v); setPage(1); }, []);
  const handlePaymentChange = useCallback((v) => { setPaymentStatus(v); setPage(1); }, []);
  const handleSortChange = useCallback((v) => { setSort(v); setPage(1); }, []);

  const handleView = useCallback((order) => setViewOrder(order), []);
  const handleStatus = useCallback((order) => setStatusOrder(order), []);

  const handleCreateSave = useCallback(async (payload) => {
    setCreateLoading(true);
    try {
      await createManualOrder.mutateAsync(payload);
      toast.success('Manual order created successfully');
      setCreateOpen(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create order');
    } finally {
      setCreateLoading(false);
    }
  }, [createManualOrder, refetch]);

  const handleAssignClick = useCallback((order) => {
    setAssignOrder(order);
    setAssignOpen(true);
  }, []);

  const handleAssignConfirm = useCallback(async (tagId) => {
    if (!assignOrder) return;
    try {
      await adminOrdersService.addTagToOrder({ orderId: assignOrder._id, tagId });
      toast.success('QR tag assigned successfully');
      setAssignOpen(false);
      setAssignOrder(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign tag');
      throw err;
    }
  }, [assignOrder, refetch]);

  const handleStatusSave = useCallback(async ({ orderId, status, reason }) => {
    setStatusLoading(true);
    try {
      if (status === 'cancelled') {
        await cancelOrder.mutateAsync({ orderId, reason });
        toast.success('Order cancelled successfully');
      } else {
        await updateFulfillmentStatus.mutateAsync({ orderId, fulfillmentStatus: status });
        toast.success(`Order status updated to ${status}`);
      }
      setStatusOrder(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update order');
    } finally {
      setStatusLoading(false);
    }
  }, [cancelOrder, updateFulfillmentStatus]);

  const openDialog = useCallback((variant, order) => {
    setDialogVariant(variant);
    setSelectedOrder(order);
    setDialogOpen(true);
  }, []);

  const handleCancel = useCallback((order) => {
    setStatusOrder(order);
  }, []);

  const handleDelete = useCallback((order) => openDialog('delete', order), [openDialog]);

  const handleConfirm = useCallback(async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id;
    try {
      if (dialogVariant === 'delete') {
        await deleteOrder.mutateAsync({ orderId });
        toast.success('Order deleted permanently');
      }
      setDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete order');
    }
  }, [selectedOrder, dialogVariant, deleteOrder]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
          {[...Array(9)].map((_, i) => <div key={i} className="bg-card rounded-[22px] border border-border h-20" />)}
        </div>
        <div className="h-9 bg-card rounded-lg border border-border w-full" />
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError && orders.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <ShoppingBag size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load orders</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors cursor-pointer">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                <ShoppingBag size={20} className="text-primary" />
              </span>
              {title}
            </h1>
            <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
              {description}
            </p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm cursor-pointer ml-[52px] sm:ml-0">
            Create Order
          </button>
        </div>
      </motion.div>

      <OrdersStatsCards stats={statsData || {}} />

      <OrdersFilters
        search={search}
        onSearchChange={handleSearchChange}
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentChange={handleFulfillmentChange}
        tagAssignmentStatus={tagAssignmentStatus}
        onTagAssignmentChange={handleTagAssignmentChange}
        paymentStatus={paymentStatus}
        onPaymentChange={handlePaymentChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalItems={meta.total}
      />

      {!isLoading && orders.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <ShoppingBag size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No orders found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {orders.length > 0 && (
        <div className="hidden lg:block">
          <OrdersTable
            orders={orders}
            onView={handleView}
            onStatus={handleStatus}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onAssign={handleAssignClick}
          />
        </div>
      )}

      {orders.length > 0 && (
        <OrderMobileCards
          orders={orders}
          onView={handleView}
          onStatus={handleStatus}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onAssign={handleAssignClick}
        />
      )}

      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      <OrderViewDialog open={!!viewOrder} onOpenChange={(o) => { if (!o) setViewOrder(null); }} order={viewOrder} />
      <OrderStatusDialog open={!!statusOrder} onOpenChange={(o) => { if (!o) setStatusOrder(null); }} order={statusOrder} onSave={handleStatusSave} isLoading={statusLoading} />
      <OrderCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreateSave} isLoading={createLoading} />
      <AssignTagModal open={assignOpen} onOpenChange={setAssignOpen} onAssign={handleAssignConfirm} />
      <ConfirmDialog open={dialogOpen} onOpenChange={setDialogOpen} variant={dialogVariant} userName={selectedOrder?.orderNumber || selectedOrder?._id || ''} onConfirm={handleConfirm} isLoading={isProcessing} />
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
