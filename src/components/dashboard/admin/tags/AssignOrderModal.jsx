'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag } from 'lucide-react';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';
import { adminOrdersService } from '@/services/dashboard-service/admin-orders.service';
import Pagination from '@/components/ui/Pagination';

const ITEMS_PER_PAGE = 5;

export default function AssignOrderModal({ open, onOpenChange, onAssign }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch,
    tagAssignmentStatus: 'pending_assignment',
    page,
    limit: ITEMS_PER_PAGE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', 'pending-assignment', filters],
    queryFn: () => adminOrdersService.getOrders(filters),
    staleTime: 10 * 1000,
    enabled: open,
  });

  const orders = data?.data || [];
  const meta = data?.meta || { page: 1, totalPage: 0, total: 0 };

  const handleSearchChange = useCallback((v) => {
    setSearch(v);
    setPage(1);
    setSelectedOrderId(null);
  }, []);

  const handleAssign = async () => {
    if (!selectedOrderId) return;
    setAssigning(true);
    try {
      await onAssign(selectedOrderId);
      setSelectedOrderId(null);
      setSearch('');
      setPage(1);
      onOpenChange(false);
    } catch (err) {
      // handled by parent
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedOrderId(null);
    setSearch('');
    setPage(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Tag to Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search pending orders (email, name, ID)..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <p className="text-xs text-foreground-tertiary">{meta.total} orders pending tag assignment</p>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-lg" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={32} className="mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground-tertiary">No pending orders found</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {orders.map((order) => {
                const customerName = order.user?.name || order.guestCustomer?.fullName || 'Guest';
                const customerEmail = order.user?.email || order.guestCustomer?.email || '';
                const products = order.items?.map((it) => it.product?.name).join(', ') || 'Product';
                const source = order.orderSource || 'website';

                return (
                  <button
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`w-full flex flex-col gap-1 p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedOrderId === order._id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/55 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className="text-xs font-semibold text-foreground">
                        Order ID: {order._id.slice(-8).toUpperCase()}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-foreground-tertiary uppercase font-medium">
                        {source}
                      </span>
                    </div>
                    <div className="text-xs">
                      <p className="font-medium text-foreground-secondary">{customerName} ({customerEmail})</p>
                      <p className="text-foreground-tertiary truncate max-w-[350px]">Products: {products}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {meta.totalPage > 1 && (
            <Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} className="pt-1" />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={assigning}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedOrderId || assigning}>
            {assigning ? 'Assigning...' : 'Assign to Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
