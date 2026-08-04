'use client';

import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Pagination from '@/components/ui/Pagination';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Cancelled' },
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Completed' },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-orders', { page, limit: 10 }],
    queryFn: async () => {
      const res = await api.get('/orders', { params: { page, limit: 10 } });
      return res.data;
    },
  });

  // Backend getUserOrders returns { data: { orders: [...], pagination: {...}, totalSpent } }
  const orders = data?.data?.orders || [];
  const meta = data?.data?.pagination || { total: 0, totalPage: 1 };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'processing' && ['pending', 'confirmed', 'processing'].includes(order.fulfillmentStatus)) ||
      (activeTab === 'completed' && ['delivered', 'completed'].includes(order.fulfillmentStatus));

    const matchesSearch = !search ||
      order._id?.toLowerCase().includes(search.toLowerCase()) ||
      order.items?.some(item => item.name?.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded-lg w-24" />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load orders</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-accent underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta.total} total orders</p>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto text-muted-foreground" size={48} />
            <p className="mt-4 text-muted-foreground">
              {search ? 'No orders match your search' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredOrders.map((order) => {
              const status = STATUS_CONFIG[order.fulfillmentStatus] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const total = order.grandTotal || order.total || 0;

              return (
                <div key={order._id} className="bg-card rounded-xl p-4 border border-border hover:border-accent/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${status.bg}`}>
                        <StatusIcon size={20} className={status.color} />
                      </div>
                      <div>
                        <p className="text-foreground font-medium text-sm">
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="mt-2">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-foreground-secondary text-xs">
                              {item.name} x{item.quantity}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-foreground-tertiary text-xs">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-medium">${total.toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPage > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
