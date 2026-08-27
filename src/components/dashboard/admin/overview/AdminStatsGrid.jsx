'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  AlertTriangle,
  Receipt,
  Package,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

export default function AdminStatsGrid({ stats = {}, actionRequired = {} }) {
  const {
    totalRevenue = 0,
    revenueGrowth = 0,
    totalOrders = 0,
    ordersGrowth = 0,
    averageOrderValue = 0,
    aovGrowth = 0,
    newCustomers = 0,
    customersGrowth = 0,
  } = stats;

  const pendingOrders = actionRequired.pendingOrdersCount || 0;
  const inventoryIssues = actionRequired.lowStockCount || 0;

  const kpis = [
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: `$${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: revenueGrowth,
      icon: DollarSign,
      color: 'emerald',
      caption: 'vs previous period',
    },
    {
      key: 'orders',
      label: 'Total Orders',
      value: Number(totalOrders).toLocaleString('en-US'),
      growth: ordersGrowth,
      icon: ShoppingBag,
      color: 'blue',
      caption: 'vs previous period',
    },
    {
      key: 'aov',
      label: 'Avg. Order Value (AOV)',
      value: `$${Number(averageOrderValue).toFixed(2)}`,
      growth: aovGrowth,
      icon: Receipt,
      color: 'indigo',
      caption: 'vs previous period',
    },
    {
      key: 'customers',
      label: 'New Customers',
      value: Number(newCustomers).toLocaleString('en-US'),
      growth: customersGrowth,
      icon: Users,
      color: 'teal',
      caption: 'vs previous period',
    },
    {
      key: 'pending_orders',
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      isAlert: pendingOrders > 0,
      alertText: pendingOrders > 0 ? 'Requires fulfillment' : 'All clear',
      icon: Clock,
      color: pendingOrders > 0 ? 'amber' : 'emerald',
      href: '/dashboard/admin/orders',
    },
    {
      key: 'inventory_alerts',
      label: 'Inventory Alerts',
      value: inventoryIssues.toString(),
      isAlert: inventoryIssues > 0,
      alertText: inventoryIssues > 0 ? 'Low / Out of stock' : 'Optimal stock',
      icon: AlertTriangle,
      color: inventoryIssues > 0 ? 'rose' : 'emerald',
      href: '/dashboard/admin/products',
    },
  ];

  const COLOR_MAP = {
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.12)]' },
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    icon: 'text-blue-400',    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.12)]' },
    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25',  icon: 'text-indigo-400',  glow: 'shadow-[0_0_15px_rgba(99,102,241,0.12)]' },
    teal:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/25',    icon: 'text-teal-400',    glow: 'shadow-[0_0_15px_rgba(20,184,166,0.12)]' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   icon: 'text-amber-400',   glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)]' },
    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    icon: 'text-rose-400',    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.12)]' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4"
    >
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const color = COLOR_MAP[kpi.color];
        const isPositive = kpi.growth >= 0;

        const content = (
          <Card className="p-4 sm:p-4.5 flex flex-col justify-between h-full hover:border-accent/30 transition-all duration-200">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-foreground-secondary tracking-wide truncate">
                {kpi.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color.bg} ${color.border} ${color.glow}`}>
                <Icon size={18} className={color.icon} />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight tracking-tight truncate">
                {kpi.value}
              </h3>

              {kpi.growth !== undefined ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {isPositive ? `+${kpi.growth}%` : `${kpi.growth}%`}
                  </span>
                  <span className="text-[10px] text-foreground-tertiary truncate">
                    {kpi.caption}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      kpi.isAlert
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    }`}
                  >
                    {kpi.alertText}
                  </span>
                </div>
              )}
            </div>
          </Card>
        );

        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            className="h-full"
          >
            {kpi.href ? (
              <Link href={kpi.href} className="block h-full cursor-pointer">
                {content}
              </Link>
            ) : (
              content
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
