'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, ShoppingBag, Search, X, SlidersHorizontal, Eye, Copy, ChevronDown, Calendar, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/ui/Pagination';
import { useDebounce } from '@/hooks/search-with-debounce/useDebounce';

const ORDERS_PER_PAGE = 10;

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
];

const STATUS_STYLES = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/25', dot: 'bg-amber-400', label: 'Pending', chip: 'border-amber-500/35 bg-amber-500/15 text-amber-300 dark:text-amber-200 light:text-amber-700 shadow-[0_0_16px_-4px_rgba(251,191,36,0.35)]' },
  assigned: { color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/25', dot: 'bg-blue-400', label: 'Assigned', chip: 'border-blue-500/35 bg-blue-500/15 text-blue-300 dark:text-blue-200 light:text-blue-700 shadow-[0_0_16px_-4px_rgba(96,165,250,0.35)]' },
  shipped: { color: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/25', dot: 'bg-violet-400', label: 'Shipped', chip: 'border-violet-500/35 bg-violet-500/15 text-violet-300 dark:text-violet-200 light:text-violet-700 shadow-[0_0_16px_-4px_rgba(167,139,250,0.35)]' },
  delivered: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', dot: 'bg-emerald-400', label: 'Delivered', chip: 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300 dark:text-emerald-200 light:text-emerald-700 shadow-[0_0_16px_-4px_rgba(52,211,153,0.35)]' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25', dot: 'bg-red-400', label: 'Cancelled', chip: 'border-red-500/35 bg-red-500/15 text-red-300 dark:text-red-200 light:text-red-700 shadow-[0_0_16px_-4px_rgba(248,113,113,0.35)]' },
};

const CONTROL_CLASS =
  'h-11 cursor-pointer rounded-xl border border-white/6 bg-background-secondary/50 backdrop-blur-md transition-all duration-300 hover:border-white/12 hover:bg-background-secondary/70 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 light:border-[#E8DFCE]/80 light:bg-white/70';

const CARD_SURFACE =
  'rounded-2xl border border-white/6 bg-card shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ' +
  'light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]';

function getStatus(chip) { return STATUS_STYLES[chip] || STATUS_STYLES.pending; }

export default function OrdersPage() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, sort]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user-orders', { page, limit: ORDERS_PER_PAGE, search: debouncedSearch, status, sort }],
    queryFn: async () => {
      const params = { page, limit: ORDERS_PER_PAGE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== 'all') params.status = status;
      if (sort !== 'newest') params.sort = sort;
      const res = await api.get('/orders', { params });
      return res.data;
    },
    staleTime: 30_000,
    retry: 1,
  });

  const orders = data?.data?.orders || [];
  const meta = data?.data?.pagination || { page: 1, total: 0, totalPage: 0 };
  const totalSpent = data?.data?.totalSpent || 0;

  const handleReset = useCallback(() => { setSearch(''); setStatus('all'); setSort('newest'); }, []);

  // Stats from backend meta
  const stats = useMemo(() => ({
    total: meta.total || 0,
    processing: orders.filter((o) => ['pending', 'assigned', 'shipped'].includes(o.fulfillmentStatus)).length,
    completed: orders.filter((o) => o.fulfillmentStatus === 'delivered').length,
    spent: totalSpent,
  }), [meta.total, orders, totalSpent]);

  // ----- Loading -----
  if (isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <OrdersHeader total={0} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl border border-white/6 bg-card animate-pulse light:border-[#E8DFCE]/80" />)}
          </div>
          <div className="mt-6 rounded-2xl border border-white/6 bg-card p-5 animate-pulse light:border-[#E8DFCE]/80">
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl" />)}</div>
          </div>
        </div>
      </div>
    );
  }

  // ----- Error -----
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <OrdersHeader total={0} />
          <div className="mt-10 flex flex-col items-center justify-center px-4 py-14 text-center">
            <div className="relative"><div className="absolute inset-0 rounded-full bg-red-500/15 blur-2xl" /><div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-400/25 bg-red-500/10"><span className="text-2xl">&#9888;&#65039;</span></div></div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Oops! Something went wrong</h3>
            <p className="mt-2 text-sm text-foreground-tertiary">{error?.message || 'Failed to load orders.'}</p>
            <button onClick={() => window.location.reload()} className="mt-6 h-10 cursor-pointer rounded-xl border border-white/6 bg-muted px-5 text-foreground hover:-translate-y-0.5 hover:bg-muted hover:shadow-md transition-all duration-300 light:border-[#E8DFCE]/80">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(debouncedSearch || status !== 'all' || sort !== 'newest');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <OrdersHeader total={meta.total} />

        {/* Stats */}
        <div className="mt-6"><OrdersStats stats={stats} /></div>

        {/* Status tabs + filters */}
        <div className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button key={tab.id} onClick={() => setStatus(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-300 cursor-pointer active:scale-95 ${
                    status === tab.id
                      ? 'border-accent/50 bg-gradient-to-r from-accent/20 to-accent/10 text-accent shadow-[0_0_20px_-4px_rgba(253,182,92,0.35)] dark:text-amber-200'
                      : 'border-white/8 bg-background-secondary/40 text-foreground-secondary hover:-translate-y-0.5 hover:border-accent/30 hover:text-foreground light:border-[#E8DFCE]/70 light:bg-white/60'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className={`relative w-full sm:w-72 ${CONTROL_CLASS}`}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-tertiary" />
                <Input type="text" placeholder="Search by order ID or item..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-full w-full border-0 bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-tertiary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none" />
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className={`w-full sm:w-40 ${CONTROL_CLASS} bg-transparent text-foreground-secondary`}><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent className="rounded-xl border border-white/6 bg-popover text-foreground shadow-xl backdrop-blur-xl light:border-[#E8DFCE]/80">
                  {SORT_OPTIONS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleReset}
                  className="h-11 cursor-pointer gap-1.5 rounded-xl px-3.5 text-foreground-tertiary hover:bg-background-secondary/70 hover:text-foreground transition-all duration-300">
                  <X className="h-4 w-4" /> Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Orders table / cards */}
        <div className="mt-6">
          {orders.length === 0 ? (
            hasActiveFilters ? (
              <div className={`${CARD_SURFACE} p-10 sm:p-14`}>
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4"><div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
                    <Package className="relative h-9 w-9 text-foreground-tertiary/60" />
                  </div>
                  <p className="text-foreground-secondary text-sm font-medium">No matching orders found</p>
                  <p className="text-foreground-tertiary text-xs mt-1.5">Try a different search or clear your filters.</p>
                  <Button variant="ghost" size="sm" onClick={handleReset} className="mt-4 cursor-pointer gap-1.5 rounded-full text-foreground-secondary hover:text-foreground">Reset Filters</Button>
                </div>
              </div>
            ) : (
              <OrdersEmptyState />
            )
          ) : (
            <div>
              {/* Desktop table */}
              <div className="hidden lg:block">
                <div className={`${CARD_SURFACE} overflow-hidden`}>
                  <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,100px)_minmax(0,90px)] items-center gap-2 px-5 py-3 text-[10px] text-foreground-tertiary font-medium uppercase tracking-wider border-b border-white/6 light:border-[#E8DFCE]/70">
                    <span>Order</span>
                    <span>Status</span>
                    <span>Date</span>
                    <span>Total</span>
                    <span className="justify-self-end">Actions</span>
                  </div>
                  <div className="divide-y divide-white/6 light:divide-[#E8DFCE]/70">
                    {orders.map((order, i) => {
                      const s = getStatus(order.fulfillmentStatus);
                      const itemNames = (order.items || [])
                        .slice(0, 2)
                        .map((it) => it.product?.name || 'Item')
                        .join(', ');
                      const more = (order.items?.length || 0) > 2 ? ` +${order.items.length - 2}` : '';
                      const total = order.grandTotal || order.total || 0;
                      return (
                        <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                          className="relative grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,100px)_minmax(0,100px)_minmax(0,90px)] items-center gap-2 px-5 py-3.5 text-sm hover:bg-muted/20 transition-colors duration-200">
                          {/* Hairline top highlight per row */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent light:via-[#E8DFCE]/50" />
                          <div className="min-w-0">
                            <p className="text-foreground font-mono text-[13px] font-medium truncate">#{order._id?.slice(-8).toUpperCase()}</p>
                            <p className="text-foreground-tertiary text-[12px] truncate mt-0.5">{itemNames}{more}</p>
                          </div>
                          <div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot} shadow-[0_0_6px_currentColor]`} />{s.label}</span></div>
                          <div className="text-foreground-tertiary text-[12px]">{format(new Date(order.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-foreground font-medium">${Number(total).toFixed(2)}</div>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setDetailId(order._id)} className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer" title="View Details"><Eye size={13} className="text-primary" /></button>
                            <button onClick={() => { navigator.clipboard?.writeText(order._id); toast.success('Order ID copied!'); }} className="w-7 h-7 rounded-lg bg-muted/50 border border-white/10 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer" title="Copy ID"><Copy size={12} className="text-foreground-tertiary" /></button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-3">
                {orders.map((order) => {
                  const s = getStatus(order.fulfillmentStatus);
                  const total = order.grandTotal || order.total || 0;
                  return (
                    <div key={order._id} className={`${CARD_SURFACE} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_24px_48px_-16px_rgb(0_0_0/0.55)]`}>
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="text-foreground font-mono text-[13px] font-medium font-mono truncate">#{order._id?.slice(-8).toUpperCase()}</p>
                          <p className="text-foreground-tertiary text-[11px] mt-0.5">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="text-foreground font-medium text-[15px]">${Number(total).toFixed(2)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot} shadow-[0_0_6px_currentColor]`} />{s.label}</span>
                        {(order.items || []).slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-[11px] text-foreground-tertiary">{item.product?.name || 'Item'} x{item.quantity}</span>
                        ))}
                        {(order.items?.length || 0) > 2 && <span className="text-[11px] text-foreground-tertiary">+{order.items.length - 2} more</span>}
                      </div>
                      <div className="mt-3 flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setDetailId(order._id)} className="cursor-pointer gap-1 text-foreground-tertiary hover:text-foreground"><Eye size={14} /> Details</Button>
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(order._id); toast.success('Copied!'); }} className="cursor-pointer text-foreground-tertiary hover:text-foreground"><Copy size={13} /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {meta.totalPage > 1 && (
            <div className="mt-10"><Pagination currentPage={meta.page} totalPages={meta.totalPage} onPageChange={setPage} /></div>
          )}
        </div>

        <OrderDetailModal orderId={detailId} onClose={() => setDetailId(null)} />
      </div>
    </motion.div>
  );
}

// ===== Sub-components =====

function OrdersHeader({ total }) {
  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5" />
            <div className="absolute inset-0 rounded-2xl border border-blue-500/25 shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)] ring-1 ring-blue-500/20" />
            <Package className="relative h-6 w-6 text-blue-400" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-foreground sm:text-3xl md:text-[34px]">My Orders</h1>
            <p className="mt-1 text-sm text-foreground-tertiary">Track and manage all your purchases</p>
          </div>
        </div>
      </div>
      <button onClick={() => window.location.href = '/shop'} className="group relative inline-flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-blue-500/25 bg-gradient-to-r from-blue-500/15 to-blue-500/5 px-4 py-2 text-[13px] font-medium text-blue-400 shadow-[0_8px_24px_-8px_rgba(96,165,250,0.3)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-[0_12px_32px_-8px_rgba(96,165,250,0.4)] active:scale-[0.98]">
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        <ShoppingBag className="h-3.5 w-3.5 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
        <span>{total} Orders</span>
      </button>
    </div>
  );
}

function OrdersStats({ stats }) {
  const configs = [
    { label: 'Total Orders', value: stats.total, sub: 'All time', color: 'bg-blue-500/20', iconColor: 'text-blue-400', glow: 'shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)]', ring: 'ring-blue-500/20', border: 'border-blue-500/25', icon: Package },
    { label: 'Processing', value: stats.processing, sub: 'In progress', color: 'bg-amber-500/20', iconColor: 'text-amber-400', glow: 'shadow-[0_0_24px_-4px_rgba(251,191,36,0.25)]', ring: 'ring-amber-500/20', border: 'border-amber-500/25', icon: Clock },
    { label: 'Completed', value: stats.completed, sub: 'Delivered', color: 'bg-emerald-500/20', iconColor: 'text-emerald-400', glow: 'shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]', ring: 'ring-emerald-500/20', border: 'border-emerald-500/25', icon: CheckCircle },
    { label: 'Total Spent', value: `$${(stats.spent || 0).toFixed(0)}`, sub: 'Lifetime', color: 'bg-violet-500/20', iconColor: 'text-violet-400', glow: 'shadow-[0_0_24px_-4px_rgba(167,139,250,0.25)]', ring: 'ring-violet-500/20', border: 'border-violet-500/25', icon: CreditCard },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {configs.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div key={idx} className={`group relative h-full overflow-hidden rounded-2xl border border-white/6 bg-card p-5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]`}>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-${idx === 0 ? 'blue' : idx === 1 ? 'amber' : idx === 2 ? 'emerald' : 'violet'}-500/[0.06] via-transparent to-transparent`} />
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.04] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/[0.04] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            <div className="relative z-10 flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${s.border} ${s.color} ${s.glow} ring-1 ${s.ring} transition-transform duration-300 group-hover:scale-105`}>
                <Icon className={`h-5 w-5 ${s.iconColor}`} strokeWidth={1.9} />
              </div>
              <div className="min-w-0"><p className="text-[11px] font-medium tracking-wide text-foreground-tertiary">{s.label}</p><h3 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-tight text-foreground sm:text-[26px]">{s.value}</h3><p className="mt-0.5 text-[11px] text-foreground-tertiary">{s.sub}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrdersEmptyState() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-14 text-center">
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/25 bg-gradient-to-br from-blue-500/15 to-blue-500/5 shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)]">
          <ShoppingBag className="h-11 w-11 text-blue-400" strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">No Orders Yet</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">You haven&apos;t placed any orders yet.</p>
      <button onClick={() => window.location.href = '/shop'} className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(96,165,250,0.5)] transition-shadow duration-300 hover:shadow-[0_16px_40px_-8px_rgba(96,165,250,0.6)]">
        <ShoppingBag className="h-4 w-4" /> Browse Products
      </button>
    </motion.div>
  );
}

function OrderDetailModal({ orderId, onClose }) {
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => { const res = await api.get(`/orders/${orderId}`); return res.data; },
    enabled: !!orderId,
    staleTime: 60_000,
  });

  const order = detailData?.data;

  return (
    <AnimatePresence>
      {orderId && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          onClick={onClose}>
          <motion.div className="relative max-w-xl w-full overflow-hidden rounded-[24px] border border-blue-500/20 bg-card shadow-2xl light:border-[#E8DFCE]/80"
            initial={{ scale: 0.9, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }} onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background-secondary/80 text-foreground-secondary backdrop-blur-sm hover:text-foreground transition-colors cursor-pointer"><X size={16} /></button>
            <div className="pointer-events-none absolute inset-0"><div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" /><div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" /></div>
            <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 space-y-5">
              {detailLoading ? (
                <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-muted rounded-xl" />)}</div>
              ) : order ? (
                <>
                  <div className="flex items-center justify-between"><p className="text-foreground font-mono text-sm font-medium">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[order.fulfillmentStatus]?.chip || STATUS_STYLES.pending.chip}`}><span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[order.fulfillmentStatus]?.dot || 'bg-amber-400'} shadow-[0_0_6px_currentColor]`} />{STATUS_STYLES[order.fulfillmentStatus]?.label || 'Pending'}</span></div>
                  <div className="space-y-3">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
                        {item.product?.image?.url ? <img src={item.product.image.url} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Package size={18} className="text-foreground-tertiary" /></div>}
                        <div className="flex-1 min-w-0"><p className="text-sm text-foreground truncate">{item.product?.name || 'Item'}</p><p className="text-[12px] text-foreground-tertiary">x{item.quantity} · ${Number(item.unitPrice || 0).toFixed(2)} each</p></div>
                        <p className="text-sm font-medium text-foreground">${Number(item.subtotal || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/6 light:border-[#E8DFCE]/70">
                    <div><p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">Date</p><p className="text-sm text-foreground mt-0.5">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">Payment</p><p className={`text-sm font-medium mt-0.5 capitalize ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{order.paymentStatus}</p></div>
                    <div><p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider">Total</p><p className="text-sm font-semibold text-foreground mt-0.5">${Number(order.grandTotal || order.total || 0).toFixed(2)}</p></div>
                    {order.shippingAddress?.address && (
                      <div><p className="text-[11px] font-medium text-foreground-tertiary uppercase tracking-wider"><MapPin size={11} className="inline mr-1" />Shipping</p><p className="text-sm text-foreground mt-0.5 truncate">{order.shippingAddress.city}, {order.shippingAddress.state}</p></div>
                    )}
                  </div>
                </>
              ) : <p className="text-foreground-tertiary text-sm text-center">Order not found.</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
