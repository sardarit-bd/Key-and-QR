'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import Card from '@/components/dashboard/user/dashboard/Card';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="text-foreground font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-foreground-secondary">
          {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n;
}

/** Orders by Status — Horizontal Bar Chart */
function OrdersStatusChart({ data = {} }) {
  const chartData = useMemo(() => {
    const items = [
      { name: 'Pending', value: data.pending || 0, color: '#f59e0b' },
      { name: 'Assigned', value: data.assigned || 0, color: '#3b82f6' },
      { name: 'Shipped', value: data.shipped || 0, color: '#14b8a6' },
      { name: 'Delivered', value: data.delivered || 0, color: '#10b981' },
      { name: 'Cancelled', value: data.cancelled || 0, color: '#ef4444' },
      { name: 'Returned', value: data.returned || 0, color: '#8b5cf6' },
    ];
    return items.filter((i) => i.value > 0);
  }, [data]);

  if (chartData.length === 0) {
    return <EmptyChart label="No order data yet" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={36} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={formatNumber} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Pie Chart for breakdown */
function BreakdownChart({ data = [], title }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  if (chartData.length === 0) {
    return <EmptyChart label="No data available" />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {chartData.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-[11px] text-foreground-tertiary">{entry.name}</span>
            <span className="text-[11px] text-foreground font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Revenue Trend — Line Chart (can be extended later) */
function RevenueChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <EmptyChart label="Revenue data will appear here once orders are processed" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--foreground-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-xs text-foreground-tertiary">{label}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-[11px] text-foreground-tertiary">{subtitle}</p>}
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

export default function AdminCharts({ ordersByStatus = {} }) {
  const hasData = Object.values(ordersByStatus).some((v) => v > 0);

  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0);

  const pieData = useMemo(() => {
    const items = [
      { name: 'Pending', value: ordersByStatus.pending || 0 },
      { name: 'Assigned', value: ordersByStatus.assigned || 0 },
      { name: 'Shipped', value: ordersByStatus.shipped || 0 },
      { name: 'Delivered', value: ordersByStatus.delivered || 0 },
      { name: 'Cancelled', value: ordersByStatus.cancelled || 0 },
    ];
    return items.filter((i) => i.value > 0);
  }, [ordersByStatus]);

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <p className="text-xs text-foreground-tertiary mt-0.5">
          {hasData
            ? `Real-time platform metrics with ${totalOrders} total orders`
            : 'Platform analytics and trends'}
        </p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        <ChartCard title="Orders by Status" subtitle="Current distribution of order fulfillment" delay={0.1}>
          <OrdersStatusChart data={ordersByStatus} />
        </ChartCard>

        <ChartCard title="Order Breakdown" subtitle="Proportional view of order states" delay={0.15}>
          <BreakdownChart data={pieData} />
        </ChartCard>
      </div>

      {!hasData && (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-sm text-foreground-tertiary">
              No order data available yet. Charts will populate as orders are created.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
