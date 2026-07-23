'use client';

import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
];

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Completed' },
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
      <div className="min-h-screen bg-[#090b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-32" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg w-24" />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#090b14] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load orders</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-[#e3ba85] underline">
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
      className="min-h-screen bg-[#090b14]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">{meta.total} total orders</p>
        </div>

        {/* Status Tabs */}
        <div className="mt-6 flex gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#e3ba85] text-black font-medium'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#e3ba85]/50"
            />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="mt-12 text-center">
            <Package className="mx-auto text-gray-600" size={48} />
            <p className="mt-4 text-gray-400">
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
                <div key={order._id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#e3ba85]/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${status.bg}`}>
                        <StatusIcon size={20} className={status.color} />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">
                          Order #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="mt-2">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <p key={idx} className="text-gray-300 text-xs">
                              {item.name} x{item.quantity}
                            </p>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-gray-500 text-xs">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${total.toFixed(2)}</p>
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
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Previous
            </button>
            <span className="text-gray-400 text-sm">
              Page {page} of {meta.totalPage}
            </span>
            <button
              onClick={() => setPage(Math.min(meta.totalPage, page + 1))}
              disabled={page === meta.totalPage}
              className="px-4 py-2 bg-white/5 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
