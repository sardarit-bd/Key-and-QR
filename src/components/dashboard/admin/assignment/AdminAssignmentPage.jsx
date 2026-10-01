'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Link2 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import AdminSearchInput from '@/components/dashboard/admin/common/AdminSearchInput';
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
  const handleTagSelect = useCallback((tag) => {
    setSelectedTag((prev) => (prev?._id === tag?._id ? null : tag));
  }, []);

  const handleOrderSelect = useCallback((order) => {
    setSelectedOrder((prev) => (prev?._id === order?._id ? null : order));
  }, []);

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

  const canAssign = Boolean(selectedTag && selectedOrder);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <Link2 size={20} className="text-[#E5C378]" />
          </span>
          QR Tag Assignment
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 ml-[52px]">
          Select an unassigned tag, choose an order, and assign the tag.
        </p>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Left: Unassigned Tags */}
        <div className="space-y-3">
          <AdminSearchInput
            value={tagSearch}
            onChange={(v) => { setTagSearch(v); setTagPage(1); }}
            placeholder="Search tags by code..."
          />

          {tagsLoading ? (
            <div className="bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl" />)}
            </div>
          ) : tags.length === 0 ? (
            <div className="p-8 rounded-2xl text-center bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 shadow-xs">
              <Link2 size={32} className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No unassigned tags available</p>
            </div>
          ) : (
            <>
              <UnassignedTagsTable tags={tags} selectedTagId={selectedTag?._id} onSelect={handleTagSelect} />
              {tagsMeta.totalPage > 1 && (
                <Pagination currentPage={tagsMeta.page} totalPages={tagsMeta.totalPage} onPageChange={setTagPage} compact />
              )}
            </>
          )}
        </div>

        {/* Right: Orders */}
        <div className="space-y-3">
          <AdminSearchInput
            value={orderSearch}
            onChange={(v) => { setOrderSearch(v); setOrderPage(1); }}
            placeholder="Search orders by customer or ID..."
          />

          {ordersLoading ? (
            <div className="bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 rounded-2xl text-center bg-white dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 shadow-xs">
              <Link2 size={32} className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">No pending orders found</p>
            </div>
          ) : (
            <>
              <OrderSelectTable orders={orders} selectedOrderId={selectedOrder?._id} selectedTag={selectedTag} onSelect={handleOrderSelect} />
              {ordersMeta.totalPage > 1 && (
                <Pagination currentPage={ordersMeta.page} totalPages={ordersMeta.totalPage} onPageChange={setOrderPage} compact />
              )}
            </>
          )}
        </div>
      </div>

      {/* Polish Bottom Action Bar */}
      {(selectedTag || selectedOrder) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 left-0 right-0 lg:left-72 p-4 bg-white/90 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-md z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">
                <span className="text-neutral-500 dark:text-neutral-400 font-normal">Assign</span>
                {selectedTag ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#E5C378]/10 text-amber-800 dark:text-[#E5C378] font-mono font-semibold text-xs border border-[#E5C378]/30 shadow-2xs">
                    {selectedTag.tagCode}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-normal text-xs border border-dashed border-neutral-300 dark:border-neutral-700">
                    Choose a Tag
                  </span>
                )}
                <span className="text-neutral-400 dark:text-neutral-600">→</span>
                {selectedOrder ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-200 font-mono font-medium text-xs border border-neutral-200 dark:border-neutral-700/60 shadow-2xs">
                    Order #{selectedOrder._id?.slice(-8).toUpperCase()}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-normal text-xs border border-dashed border-neutral-300 dark:border-neutral-700">
                    Choose an Order
                  </span>
                )}
              </div>

              {canAssign ? (
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mr-0.5">
                    {selectedOrder.user?.name || selectedOrder.guestCustomer?.fullName || 'Guest'}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-600">·</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    ${Number(selectedOrder.grandTotal).toFixed(2)}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-600">·</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E5C378]/10 text-amber-800 dark:text-[#E5C378] border border-[#E5C378]/25">
                    Order: {formatStatusLabel(selectedOrder.fulfillmentStatus || 'pending')}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                    Payment: {formatStatusLabel(selectedOrder.paymentStatus || 'pending')}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/25">
                    Assignment: {formatStatusLabel(getOrderAssignmentStatus(selectedOrder, selectedTag))}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-amber-700 dark:text-[#E5C378] mt-1">
                  {!selectedTag ? 'Please select a tag from the left column.' : 'Please select an order from the right column.'}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAssignClick}
              disabled={!canAssign || assignLoading}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 select-none flex-shrink-0 ${
                canAssign && !assignLoading
                  ? 'bg-gradient-to-r from-[#E5C378] to-[#d8b564] hover:from-[#ebd292] hover:to-[#dfbe6e] text-neutral-950 font-semibold shadow-md shadow-[#E5C378]/20 border border-[#E5C378]/50 active:scale-[0.99] cursor-pointer'
                  : 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 cursor-not-allowed opacity-60'
              }`}
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
