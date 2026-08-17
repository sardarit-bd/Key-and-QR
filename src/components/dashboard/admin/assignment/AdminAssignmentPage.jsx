'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link2, Search } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import {
  useUnassignedTags,
  useAdminAssignmentActions,
} from '@/hooks/dashboard/useAdminAssignment';
import { useAdminOrders } from '@/hooks/dashboard/useAdminOrders';
import UnassignedTagsTable from './UnassignedTagsTable';
import OrderSelectTable from './OrderSelectTable';
import AssignDialog from './AssignDialog';
import Pagination from '@/components/ui/Pagination';
import { formatStatusLabel, getOrderAssignmentStatus } from '@/utils/statusFormatter';

const ITEMS_PER_PAGE = 10;

export default function AdminAssignmentPage() {
  // Unassigned tags filter
  const [tagSearch, setTagSearch] = useState('');
  const [tagPage, setTagPage] = useState(1);
  const debouncedTagSearch = useDebounce(tagSearch, 300);

  // Order search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const debouncedOrderSearch = useDebounce(orderSearch, 300);

  // Selection
  const [selectedTag, setSelectedTag] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Confirm dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // Data
  const tagFilters = { search: debouncedTagSearch, page: tagPage, limit: ITEMS_PER_PAGE };
  const { data: tagsData, isLoading: tagsLoading } = useUnassignedTags(tagFilters);
  const orderFilters = { search: debouncedOrderSearch, page: orderPage, limit: ITEMS_PER_PAGE, fulfillmentStatus: 'pending' };
  const { data: ordersData, isLoading: ordersLoading } = useAdminOrders(orderFilters);

  const { assignTag } = useAdminAssignmentActions();

  const tags = Array.isArray(tagsData?.data) ? tagsData.data : Array.isArray(tagsData) ? tagsData : [];
  const tagsMeta = tagsData?.meta || { page: 1, totalPage: 0, total: tags.length };
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : Array.isArray(ordersData) ? ordersData : [];
  const ordersMeta = ordersData?.meta || { page: 1, totalPage: 0, total: orders.length };

  // Handlers
  const handleTagSelect = useCallback((tag) => setSelectedTag(tag), []);
  const handleOrderSelect = useCallback((order) => setSelectedOrder(order), []);

  const handleAssignClick = useCallback(() => {
    if (selectedTag && selectedOrder) {
      setAssignOpen(true);
    }
  }, [selectedTag, selectedOrder]);

  const handleAssignConfirm = useCallback(async (tag, order) => {
    setAssignLoading(true);
    try {
      await assignTag.mutateAsync({ orderId: order._id, tagId: tag._id });
      toast.success(`Tag "${tag.tagCode}" assigned to order #${order._id.slice(-8).toUpperCase()}`);
      setAssignOpen(false);
      setSelectedTag(null);
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign tag');
    } finally {
      setAssignLoading(false);
    }
  }, [assignTag]);

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Link2 size={20} className="text-primary" />
          </span>
          QR Tag Assignment
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          Select an unassigned tag, choose an order, and assign the tag.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Left: Unassigned Tags */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
            <Input
              value={tagSearch}
              onChange={(e) => { setTagSearch(e.target.value); setTagPage(1); }}
              placeholder="Search tags by code..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          {tagsLoading ? (
            <div className="bg-card rounded-[22px] border border-border p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
            </div>
          ) : tags.length === 0 ? (
            <Card className="p-8 text-center">
              <Link2 size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground-tertiary">No unassigned tags available</p>
            </Card>
          ) : (
            <>
              <UnassignedTagsTable tags={tags} selectedTagId={selectedTag?._id} onSelect={handleTagSelect} />
              {tagsMeta.totalPage > 1 && (
                <Pagination currentPage={tagsMeta.page} totalPages={tagsMeta.totalPage} onPageChange={setTagPage} />
              )}
            </>
          )}
        </div>

        {/* Right: Orders */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
            <Input
              value={orderSearch}
              onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
              placeholder="Search orders by customer or ID..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          {ordersLoading ? (
            <div className="bg-card rounded-[22px] border border-border p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center">
              <Link2 size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground-tertiary">No pending orders found</p>
            </Card>
          ) : (
            <>
              <OrderSelectTable orders={orders} selectedOrderId={selectedOrder?._id} selectedTag={selectedTag} onSelect={handleOrderSelect} />
              {ordersMeta.totalPage > 1 && (
                <Pagination currentPage={ordersMeta.page} totalPages={ordersMeta.totalPage} onPageChange={setOrderPage} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign action bar */}
      {selectedTag && selectedOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 lg:left-72 p-4 bg-background/90 backdrop-blur-lg border-t border-border z-40"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                Assign <span className="text-primary font-bold">{selectedTag.tagCode}</span> → Order #
                {selectedOrder._id?.slice(-8).toUpperCase()}
              </p>
              <p className="text-xs text-foreground-tertiary truncate flex items-center gap-1.5 mt-0.5">
                <span>{selectedOrder.user?.name || selectedOrder.guestCustomer?.fullName || 'Guest'}</span>
                <span>·</span>
                <span>${Number(selectedOrder.grandTotal).toFixed(2)}</span>
                <span>·</span>
                <span>Order: {formatStatusLabel(selectedOrder.fulfillmentStatus || 'pending')}</span>
                <span>·</span>
                <span>Payment: {formatStatusLabel(selectedOrder.paymentStatus || 'pending')}</span>
                <span>·</span>
                <span>Assignment: {formatStatusLabel(getOrderAssignmentStatus(selectedOrder, selectedTag))}</span>
              </p>
            </div>
            <button
              onClick={handleAssignClick}
              className="ml-4 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors text-sm flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Link2 size={16} />
              Assign Tag
            </button>
          </div>
        </motion.div>
      )}

      {/* Assign confirmation dialog */}
      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        selectedTag={selectedTag}
        selectedOrder={selectedOrder}
        onAssign={handleAssignConfirm}
        isLoading={assignLoading}
      />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' } }} />
    </div>
  );
}
