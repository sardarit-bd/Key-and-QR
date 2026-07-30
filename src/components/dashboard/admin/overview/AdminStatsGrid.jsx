'use client';

import { motion } from 'framer-motion';
import { Users, ShoppingBag, Package, DollarSign, QrCode, Quote } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATS_DEFINITIONS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'indigo' },
  { key: 'totalOrders', label: 'Total Orders', icon: ShoppingBag, color: 'blue' },
  { key: 'totalProducts', label: 'Total Products', icon: Package, color: 'teal' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: DollarSign, color: 'emerald' },
  { key: 'activeTags', label: 'Active QR Tags', icon: QrCode, color: 'amber' },
  { key: 'totalQuotes', label: 'Total Quotes', icon: Quote, color: 'purple' },
];

const COLOR_MAP = {
  indigo:  { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
  blue:    { border: 'border-blue-500/30',  bg: 'bg-blue-500/10',   icon: 'text-blue-400',   glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
  teal:    { border: 'border-teal-500/30',  bg: 'bg-teal-500/10',   icon: 'text-teal-400',   glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/10',  icon: 'text-amber-400',  glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
  purple:  { border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
};

function formatStatValue(key, value) {
  if (key === 'totalRevenue') return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return Number(value).toLocaleString('en-US');
}

export default function AdminStatsGrid({ stats = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5"
    >
      {STATS_DEFINITIONS.map((def, i) => {
        const Icon = def.icon;
        const color = COLOR_MAP[def.color];
        const value = stats[def.key] ?? 0;

        return (
          <motion.div
            key={def.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color.bg} ${color.border} ${color.glow}`}>
                  <Icon size={22} className={`${color.icon} sm:w-[22px] sm:h-[22px]`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-foreground-tertiary font-medium truncate">
                    {def.label}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">
                    {formatStatValue(def.key, value)}
                  </h3>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
