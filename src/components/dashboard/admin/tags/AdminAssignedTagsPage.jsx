'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { adminTagsService } from '@/services/dashboard-service/admin-tags.service';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import { adminUsersService } from '@/services/dashboard-service/admin-users.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AssignedTagsTable from './AssignedTagsTable';
import TagQRDialog from './TagQRDialog';
import UserInfoSheet from '../shared/UserInfoSheet';
import OrderInfoSheet from '../shared/OrderInfoSheet';
import ConfirmDialog from '../shared/ConfirmDialog';
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

const ITEMS_PER_PAGE = 10;

export default function AdminAssignedTagsPage() {
  const [search, setSearch] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [qrTag, setQrTag] = useState(null);
  const [unassignTag, setUnassignTag] = useState(null);
  const [unassignOpen, setUnassignOpen] = useState(false);

  // User/Order sheet state
  const [viewUserOpen, setViewUserOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [viewOrderOpen, setViewOrderOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const queryClient = useQueryClient();
  const filters = { search: debouncedSearch, subscriptionType, page, limit: ITEMS_PER_PAGE };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-tags', 'assigned', filters],
    queryFn: () => adminTagsService.getAssignedTags(filters),
    staleTime: 30 * 1000,
    retry: 2,
  });

  const tags = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => { setSearch(v); setPage(1); }, []);
  const handlePlanChange = useCallback((v) => { setSubscriptionType(v); setPage(1); }, []);

  const handleShowQR = useCallback((tag) => setQrTag(tag), []);

  const handleViewUser = useCallback(async (tag) => {
    if (!tag.owner?._id) {
      toast.error('No user assigned to this tag');
      return;
    }
    try {
      const res = await adminUsersService.getUserById({ userId: tag.owner._id, useMock: false });
      setViewUser(res.data);
      setViewUserOpen(true);
    } catch (err) {
      // Fallback: show basic data from tag.owner
      setViewUser(tag.owner);
      setViewUserOpen(true);
    }
  }, []);

  const handleViewOrder = useCallback(async (tag) => {
    // Search for orders containing this tag
    try {
      const res = await adminOrdersService.getOrderById(tag._id);
      setViewOrder(res.data);
    } catch {
      setViewOrder({ _id: '—', orderNumber: '—', user: tag.owner });
    }
    setViewOrderOpen(true);
  }, []);

  const handleUnassign = useCallback((tag) => {
    setUnassignTag(tag);
    setUnassignOpen(true);
  }, []);

  const handleUnassignConfirm = useCallback(async () => {
    if (!unassignTag) return;
    try {
      await adminTagsService.updateTag(unassignTag._id, { isActive: true, isActivated: false });
      toast.success(`Tag "${unassignTag.tagCode}" unassigned`);
      setUnassignOpen(false);
      setUnassignTag(null);
      queryClient.invalidateQueries({ queryKey: ['admin-tags', 'assigned'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to unassign tag');
    }
  }, [unassignTag, queryClient]);

  if (isLoading && tags.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 animate-pulse">
        <div className="bg-card rounded-[22px] border border-border p-6 space-y-4">
          <div className="h-4 bg-muted rounded w-24" />
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError && tags.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle size={28} className="mx-auto mb-3 text-destructive" />
          <p className="text-destructive text-sm mb-2 font-medium">Failed to load assigned tags</p>
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
            <CheckCircle size={20} className="text-emerald-400" />
          </span>
          Assigned Tags
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          View and manage QR tags that have been assigned to users and orders.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by tag code..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={subscriptionType} onValueChange={handlePlanChange}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="subscriber">Subscriber</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-foreground-tertiary">{meta.total} assigned tags</p>

      {!isLoading && tags.length === 0 && (
        <Card className="p-10 sm:p-12">
          <div className="text-center">
            <CheckCircle size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">No assigned tags</p>
            <p className="text-xs text-foreground-tertiary">All tags are currently unassigned.</p>
          </div>
        </Card>
      )}

      {tags.length > 0 && (
        <AssignedTagsTable tags={tags} onShowQR={handleShowQR} onUnassign={handleUnassign} onViewUser={handleViewUser} onViewOrder={handleViewOrder} />
      )}

      {meta.totalPage > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-2" />
      )}

      <TagQRDialog open={!!qrTag} onOpenChange={(o) => { if (!o) setQrTag(null); }} tag={qrTag} />
      <ConfirmDialog open={unassignOpen} onOpenChange={setUnassignOpen} variant="delete" userName={unassignTag?.tagCode || ''} onConfirm={handleUnassignConfirm} isLoading={false} />

      <UserInfoSheet open={viewUserOpen} onOpenChange={setViewUserOpen} user={viewUser} />
      <OrderInfoSheet open={viewOrderOpen} onOpenChange={setViewOrderOpen} order={viewOrder} />

      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)' } }} />
    </div>
  );
}
