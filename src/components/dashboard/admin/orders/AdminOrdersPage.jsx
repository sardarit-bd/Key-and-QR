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
import OrdersStatsCards from './OrdersStatsCards';
import OrdersFilters from './OrdersFilters';
import OrdersTable from './OrdersTable';
import OrderMobileCards from './OrderMobileCards';
import OrderViewDialog from './OrderViewDialog';
import OrderStatusDialog from './OrderStatusDialog';
import ConfirmDialog from '../shared/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // View dialog
  const [viewOrder, setViewOrder] = useState(null);

  // Status dialog
  const [statusOrder, setStatusOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Cancel / Delete confirmation
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState('delete');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Data — backend only supports search, fulfillmentStatus, page, limit
  const filters = { search: debouncedSearch, fulfillmentStatus, page, limit: ITEMS_PER_PAGE };
  const { data, isLoading, isError, error, refetch } = useAdminOrders(filters);
  const { data: statsData } = useAdminOrdersStats();
  const { updateFulfillmentStatus, cancelOrder, deleteOrder } = useAdminOrderActions();

  const orders = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const isProcessing = updateFulfillmentStatus.isPending || cancelOrder.isPending || deleteOrder.isPending;

  // Filter handlers
  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handleFulfillmentChange = useCallback((v) => { setFulfillmentStatus(v); setPage(1); }, []);
  const handlePaymentChange = useCallback((v) => { setPaymentStatus(v); setPage(1); }, []);
  const handleSortChange = useCallback((v) => { setSort(v); setPage(1); }, []);

  // View
  const handleView = useCallback((order) => setViewOrder(order), []);

  // Status update
  const handleStatus = useCallback((order) => setStatusOrder(order), []);

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

  // Confirm dialog
  const openDialog = useCallback((variant, order) => {
    setDialogVariant(variant);
    setSelectedOrder(order);
    setDialogOpen(true);
  }, []);

  const handleCancel = useCallback((order) => {
    // Open status dialog pre-selected to cancelled
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

  // Loading
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

  // Error
  if (isError && orders.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <ShoppingBag size={28} className="text-destructive" />
          </div>
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load orders</p>
          <p className="text-foreground-tertiary text-xs mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => refetch()} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <ShoppingBag size={20} className="text-primary" />
          </span>
          Orders Management
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          View, manage, and fulfill all platform orders.
        </p>
      </motion.div>

      {/* Stats */}
      <OrdersStatsCards stats={statsData || {}} />

      {/* Filters */}
      <OrdersFilters
        search={search}
        onSearchChange={handleSearchChange}
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentChange={handleFulfillmentChange}
        paymentStatus={paymentStatus}
        onPaymentChange={handlePaymentChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalItems={meta.total}
      />

      {/* No results */}
      {!isLoading && orders.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <ShoppingBag size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No orders found</p>
            <p className="text-xs text-foreground-tertiary">Try adjusting your search or filter criteria.</p>
          </div>
        </Card>
      )}

      {/* Desktop table */}
      {orders.length > 0 && (
        <div className="hidden lg:block">
          <OrdersTable orders={orders} onView={handleView} onStatus={handleStatus} onCancel={handleCancel} onDelete={handleDelete} />
        </div>
      )}

      {/* Mobile cards */}
      {orders.length > 0 && (
        <OrderMobileCards orders={orders} onView={handleView} onStatus={handleStatus} onCancel={handleCancel} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      {/* View dialog */}
      <OrderViewDialog open={!!viewOrder} onOpenChange={(o) => { if (!o) setViewOrder(null); }} order={viewOrder} />

      {/* Status dialog */}
      <OrderStatusDialog open={!!statusOrder} onOpenChange={(o) => { if (!o) setStatusOrder(null); }} order={statusOrder} onSave={handleStatusSave} isLoading={statusLoading} />

      {/* Delete confirmation */}
      <ConfirmDialog open={dialogOpen} onOpenChange={setDialogOpen} variant={dialogVariant} userName={selectedOrder?.orderNumber || selectedOrder?._id || ''} onConfirm={handleConfirm} isLoading={isProcessing} />

      {/* Toast */}
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
    </div>
  );
}
