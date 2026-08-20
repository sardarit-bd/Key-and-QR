'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Package,
  Layers,
  AlertCircle,
  QrCode,
  Quote,
  Sparkles,
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

// Theme Colors
const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  indigo: '#6366f1',
  teal: '#14b8a6',
  amber: '#f59e0b',
  rose: '#ef4444',
  purple: '#8b5cf6',
  slate: '#64748b',
};

const PIE_PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#64748b'];

// Number Formatters
function formatCurrency(val) {
  return `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(n) {
  const num = Number(n || 0);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

function formatCount(n) {
  const num = Number(n || 0);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
}

// Custom Tooltip for Time Series
function SalesPerformanceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload || {};

  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border rounded-2xl p-3.5 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
      <p className="text-foreground font-bold border-b border-border/60 pb-1 text-xs">
        {data.label || label}
      </p>
      {data.revenue !== undefined && (
        <div className="flex items-center justify-between gap-3 text-emerald-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Revenue:
          </span>
          <span className="font-semibold text-foreground">{formatCurrency(data.revenue)}</span>
        </div>
      )}
      {data.orders !== undefined && (
        <div className="flex items-center justify-between gap-3 text-blue-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Orders:
          </span>
          <span className="font-semibold text-foreground">{data.orders}</span>
        </div>
      )}
      {data.aov > 0 && (
        <div className="flex items-center justify-between gap-3 text-indigo-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-400" /> AOV:
          </span>
          <span className="font-semibold text-foreground">{formatCurrency(data.aov)}</span>
        </div>
      )}
      {data.prevRevenue > 0 && (
        <div className="flex items-center justify-between gap-3 text-foreground-tertiary border-t border-border/40 pt-1 text-[11px]">
          <span>Prev. Revenue:</span>
          <span className="font-medium text-foreground-secondary">{formatCurrency(data.prevRevenue)}</span>
        </div>
      )}
    </div>
  );
}

function GenericChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-xl text-xs space-y-1">
      <p className="text-foreground font-semibold mb-0.5">{label || payload[0]?.name}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-3" style={{ color: entry.color }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}:
          </span>
          <span className="font-bold text-foreground">
            {unit === '$' ? formatCurrency(entry.value) : `${entry.value} ${unit}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message = 'No data recorded for this period' }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center text-center p-4">
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center mb-2 text-foreground-tertiary">
        <Sparkles size={18} />
      </div>
      <p className="text-xs text-foreground-tertiary font-medium">{message}</p>
      <p className="text-[11px] text-foreground-tertiary/70 mt-0.5">Try selecting a different date range.</p>
    </div>
  );
}

/* ============================================================
   1. PRIMARY LARGE CHART: SALES & REVENUE PERFORMANCE
   ============================================================ */
function PrimarySalesChart({ salesTrend = [] }) {
  const [viewMode, setViewMode] = useState('both'); // 'revenue' | 'orders' | 'both' | 'comparison'

  const hasData = salesTrend.some((d) => (d.revenue || 0) > 0 || (d.orders || 0) > 0);

  return (
    <Card className="p-4 sm:p-6 flex flex-col justify-between">
      {/* Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <TrendingUp size={18} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Sales Performance</h2>
              <p className="text-xs text-foreground-secondary">
                Real-time revenue, orders, and growth trajectory over time.
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border self-start sm:self-auto">
          {[
            { id: 'both', label: 'Revenue & Orders' },
            { id: 'revenue', label: 'Revenue ($)' },
            { id: 'orders', label: 'Orders' },
            { id: 'comparison', label: 'vs Prev Period' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === mode.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-foreground-tertiary hover:text-foreground'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-5 w-full h-[320px] sm:h-[360px]">
        {!hasData ? (
          <EmptyChart message="No sales recorded for this date range" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPrevRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.slate} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.slate} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompact}
              />
              {(viewMode === 'both' || viewMode === 'orders') && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCount}
                />
              )}

              <Tooltip content={<SalesPerformanceTooltip />} />

              {/* Revenue Area */}
              {(viewMode === 'revenue' || viewMode === 'both' || viewMode === 'comparison') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={COLORS.emerald}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, fill: COLORS.emerald, stroke: '#fff', strokeWidth: 2 }}
                />
              )}

              {/* Comparison Previous Period */}
              {viewMode === 'comparison' && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="prevRevenue"
                  name="Prev. Revenue"
                  stroke={COLORS.slate}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPrevRevenue)"
                />
              )}

              {/* Orders Line/Area */}
              {(viewMode === 'orders' || viewMode === 'both') && (
                <Area
                  yAxisId={viewMode === 'orders' ? 'left' : 'right'}
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  activeDot={{ r: 5, fill: COLORS.blue }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

/* ============================================================
   2. SECOND ROW: ORDERS TREND & CUSTOMER GROWTH
   ============================================================ */
function OrdersTrendChart({ ordersTrend = [] }) {
  const hasData = ordersTrend.some((d) => d.totalOrders > 0);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <ShoppingBag size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Orders Over Time</h3>
            <p className="text-[11px] text-foreground-secondary">Order volume and fulfillment trends</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-60">
        {!hasData ? (
          <EmptyChart message="No order history in this timeframe" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<GenericChartTooltip unit="orders" />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="totalOrders" name="Total Orders" fill={COLORS.blue} radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="completedOrders" name="Completed" fill={COLORS.emerald} radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function CustomerGrowthChart({ customerGrowth = [] }) {
  const hasData = customerGrowth.some((d) => d.newCustomers > 0);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
            <Users size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Customer Growth</h3>
            <p className="text-[11px] text-foreground-secondary">New account registrations per period</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-60">
        {!hasData ? (
          <EmptyChart message="No new registrations in this timeframe" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={customerGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<GenericChartTooltip unit="users" />} />
              <Area
                type="monotone"
                dataKey="newCustomers"
                name="New Customers"
                stroke={COLORS.teal}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCustomers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

/* ============================================================
   3. THIRD ROW: ORDER STATUS & PAYMENT HEALTH (DONUTS)
   ============================================================ */
function OrderStatusDonut({ ordersByStatus = [] }) {
  const activeItems = ordersByStatus.filter((s) => s.count > 0);
  const total = activeItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Layers size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Order Status</h3>
            <p className="text-[11px] text-foreground-secondary">Fulfillment status breakdown</p>
          </div>
        </div>
        <Link
          href="/new-dashboard/admin/orders"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Orders <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4 min-h-[220px]">
        {activeItems.length === 0 ? (
          <EmptyChart message="No order status distribution data" />
        ) : (
          <>
            <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeItems}
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {activeItems.map((entry, i) => (
                      <Cell key={i} fill={entry.color || PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<GenericChartTooltip unit="orders" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-foreground">{total}</span>
                <span className="text-[10px] text-foreground-tertiary uppercase">Orders</span>
              </div>
            </div>

            {/* Legend / Status Pill Grid */}
            <div className="flex-1 space-y-1.5 w-full">
              {activeItems.map((item, i) => (
                <Link
                  key={i}
                  href={`/new-dashboard/admin/orders?status=${item.name.toLowerCase()}`}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted/40 transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground-secondary font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{item.count}</span>
                    <span className="text-[10px] text-foreground-tertiary">({item.percentage}%)</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function PaymentHealthDonut({ paymentHealth = [] }) {
  const activeItems = paymentHealth.filter((p) => p.count > 0);
  const failedItem = paymentHealth.find((p) => p.name.toLowerCase() === 'failed');
  const hasFailed = failedItem && failedItem.count > 0;

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <CreditCard size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Payment Health</h3>
            <p className="text-[11px] text-foreground-secondary">Payment success & transaction health</p>
          </div>
        </div>

        {hasFailed ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/15 border border-rose-500/25 px-2 py-0.5 rounded-full animate-pulse">
            <AlertCircle size={12} /> {failedItem.count} Failed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> 100% Healthy
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4 min-h-[220px]">
        {activeItems.length === 0 ? (
          <EmptyChart message="No transaction health records yet" />
        ) : (
          <>
            <div className="w-40 h-40 shrink-0 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeItems}
                    innerRadius={46}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {activeItems.map((entry, i) => (
                      <Cell key={i} fill={entry.color || PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<GenericChartTooltip unit="payments" />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-2 w-full">
              {activeItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-foreground-secondary font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{item.count}</span>
                    <span className="text-[10px] text-foreground-tertiary ml-1.5">({item.percentage}%)</span>
                    <p className="text-[10px] text-foreground-tertiary">{formatCurrency(item.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

/* ============================================================
   4. FOURTH ROW: TOP PRODUCTS & CATEGORY SALES
   ============================================================ */
function TopProductsChart({ topProducts = [] }) {
  const [metric, setMetric] = useState('revenue'); // 'revenue' | 'units'

  const chartData = useMemo(() => {
    return [...topProducts]
      .sort((a, b) => (metric === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold))
      .slice(0, 5)
      .map((p) => ({
        name: p.name.length > 18 ? `${p.name.slice(0, 18)}...` : p.name,
        value: metric === 'revenue' ? p.revenue : p.unitsSold,
        rawName: p.name,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      }));
  }, [topProducts, metric]);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Package size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Products</h3>
            <p className="text-[11px] text-foreground-secondary">Best-performing catalog items</p>
          </div>
        </div>

        <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border self-start sm:self-auto text-xs">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              metric === 'revenue' ? 'bg-card text-foreground shadow-sm' : 'text-foreground-tertiary'
            }`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setMetric('units')}
            className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
              metric === 'units' ? 'bg-card text-foreground shadow-sm' : 'text-foreground-tertiary'
            }`}
          >
            By Units Sold
          </button>
        </div>
      </div>

      <div className="mt-4 h-60">
        {chartData.length === 0 ? (
          <EmptyChart message="No product sales recorded in this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={metric === 'revenue' ? formatCompact : formatCount}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<GenericChartTooltip unit={metric === 'revenue' ? '$' : 'units'} />} />
              <Bar dataKey="value" fill={COLORS.purple} radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function CategorySalesChart({ categorySales = [] }) {
  const chartData = useMemo(() => {
    return categorySales.slice(0, 5).map((c) => ({
      name: c.name,
      value: c.revenue,
      percentage: c.percentage,
      unitsSold: c.unitsSold,
    }));
  }, [categorySales]);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Layers size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Sales by Category</h3>
            <p className="text-[11px] text-foreground-secondary">Revenue contribution by product type</p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-60">
        {chartData.length === 0 ? (
          <EmptyChart message="No category sales in this period" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompact}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                axisLine={false}
                tickLine={false}
                width={85}
              />
              <Tooltip content={<GenericChartTooltip unit="$" />} />
              <Bar dataKey="value" fill={COLORS.indigo} radius={[0, 4, 4, 0]} barSize={18}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

/* ============================================================
   5. FIFTH ROW: INVENTORY HEALTH & QR TAG STATUS
   ============================================================ */
function InventoryHealthChart({ inventoryHealth = [] }) {
  const outOfStock = inventoryHealth.find((i) => i.name === 'Out of Stock')?.count || 0;
  const lowStock = inventoryHealth.find((i) => i.name === 'Low Stock')?.count || 0;

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Package size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Inventory Health</h3>
            <p className="text-[11px] text-foreground-secondary">Catalog stock levels</p>
          </div>
        </div>
        <Link
          href="/new-dashboard/admin/products"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Manage <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4 min-h-[190px]">
        <div className="w-36 h-36 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={inventoryHealth} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="count">
                {inventoryHealth.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<GenericChartTooltip unit="products" />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {inventoryHealth.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground-secondary font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{item.count}</span>
                <span className="text-[10px] text-foreground-tertiary">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TagStatusChart({ tagStatus = [] }) {
  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <QrCode size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">QR Tag Status</h3>
            <p className="text-[11px] text-foreground-secondary">Hardware QR tag inventory & assignment</p>
          </div>
        </div>
        <Link
          href="/new-dashboard/admin/tags"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Tags <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4 min-h-[190px]">
        <div className="w-36 h-36 shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tagStatus} innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="count">
                {tagStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<GenericChartTooltip unit="tags" />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {tagStatus.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground-secondary font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{item.count}</span>
                <span className="text-[10px] text-foreground-tertiary">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   6. SIXTH ROW: QUOTE MODERATION & SUBSCRIPTION PERFORMANCE
   ============================================================ */
function QuoteModerationWidget({ quoteModeration = [] }) {
  const pendingCount = quoteModeration.find((q) => q.name === 'Pending')?.count || 0;
  const approvedCount = quoteModeration.find((q) => q.name === 'Approved')?.count || 0;

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <Quote size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Quote Moderation</h3>
            <p className="text-[11px] text-foreground-secondary">User submissions awaiting review</p>
          </div>
        </div>
        <Link
          href="/new-dashboard/admin/quotes/pending"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Review <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 flex flex-col justify-center space-y-3">
        {pendingCount > 0 ? (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">{pendingCount} quotes awaiting review</p>
                <p className="text-[11px] text-foreground-secondary">Submissions need admin moderation</p>
              </div>
            </div>
            <Link
              href="/new-dashboard/admin/quotes/pending"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition"
            >
              Review →
            </Link>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="text-xs font-medium text-foreground">All quotes moderated and approved.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-muted/20 border border-border">
            <span className="text-[11px] text-foreground-tertiary">Active Quotes</span>
            <p className="text-lg font-bold text-foreground">{approvedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/20 border border-border">
            <span className="text-[11px] text-foreground-tertiary">Pending Review</span>
            <p className="text-lg font-bold text-amber-400">{pendingCount}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SubscriptionPerformanceWidget({ subscriptionAnalytics = {} }) {
  const activeSubscribers = subscriptionAnalytics.activeSubscribers || 0;
  const mrr = subscriptionAnalytics.monthlyRevenue || (activeSubscribers * 4.99);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Sparkles size={17} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">Subscription Performance</h3>
            <p className="text-[11px] text-foreground-secondary">MyInspire+ recurring memberships</p>
          </div>
        </div>
        <Link
          href="/new-dashboard/admin/subscriptions"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          View <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-muted/20 border border-border">
            <span className="text-[11px] text-foreground-tertiary">Active Subscribers</span>
            <p className="text-xl font-extrabold text-foreground">{activeSubscribers}</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/20 border border-border">
            <span className="text-[11px] text-foreground-tertiary">Est. Monthly MRR</span>
            <p className="text-xl font-extrabold text-emerald-400">{formatCurrency(mrr)}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-muted/10 border border-border/60 flex items-center justify-between text-xs">
          <span className="text-foreground-secondary">Plan: MyInspire+ ($4.99/mo)</span>
          <span className="font-semibold text-emerald-400">Active</span>
        </div>
      </div>
    </Card>
  );
}

/* ============================================================
   MAIN EXPORT: ADMIN CHARTS SECTION
   ============================================================ */
export default function AdminCharts({ charts = {} }) {
  const {
    salesTrend = [],
    ordersTrend = [],
    customerGrowth = [],
    ordersByStatus = [],
    paymentHealth = [],
    inventoryHealth = [],
    tagStatus = [],
    topProducts = [],
    categorySales = [],
    quoteModeration = [],
    subscriptionAnalytics = {},
  } = charts;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Primary Large Sales & Revenue Chart */}
      <PrimarySalesChart salesTrend={salesTrend} />

      {/* 2. Second Row: Orders Trend & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <OrdersTrendChart ordersTrend={ordersTrend} />
        <CustomerGrowthChart customerGrowth={customerGrowth} />
      </div>

      {/* 3. Third Row: Order Status Distribution & Payment Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <OrderStatusDonut ordersByStatus={ordersByStatus} />
        <PaymentHealthDonut paymentHealth={paymentHealth} />
      </div>

      {/* 4. Fourth Row: Top Products & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <TopProductsChart topProducts={topProducts} />
        <CategorySalesChart categorySales={categorySales} />
      </div>

      {/* 5. Fifth Row: Inventory Health & QR Tag Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <InventoryHealthChart inventoryHealth={inventoryHealth} />
        <TagStatusChart tagStatus={tagStatus} />
      </div>

      {/* 6. Sixth Row: Quote Moderation & Subscription Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <QuoteModerationWidget quoteModeration={quoteModeration} />
        <SubscriptionPerformanceWidget subscriptionAnalytics={subscriptionAnalytics} />
      </div>
    </div>
  );
}
