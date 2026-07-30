'use client';

import { motion } from 'framer-motion';
import {
  ShoppingBag, Clock, Tag, Truck, PackageCheck, Ban,
  RotateCcw, CreditCard, DollarSign
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATS_DEFS = [
  { key: 'total', label: 'Total Orders', icon: ShoppingBag, color: 'indigo' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
  { key: 'assigned', label: 'Assigned', icon: Tag, color: 'blue' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'teal' },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck, color: 'emerald' },
  { key: 'cancelled', label: 'Cancelled', icon: Ban, color: 'red' },
  { key: 'returned', label: 'Returned', icon: RotateCcw, color: 'purple' },
  { key: 'paid', label: 'Paid', icon: CreditCard, color: 'emerald' },
  { key: 'refunded', label: 'Refunded', icon: DollarSign, color: 'red' },
];

const COLOR_MAP = {
  indigo:  { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
  red:     { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
  purple:  { border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  teal:    { border: 'border-teal-500/30', bg: 'bg-teal-500/10', icon: 'text-teal-400', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]' },
};

export default function OrdersStatsCards({ stats = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3"
    >
      {STATS_DEFS.map((def, i) => {
        const Icon = def.icon;
        const color = COLOR_MAP[def.color];
        const value = stats[def.key] ?? 0;

        return (
          <motion.div
            key={def.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
          >
            <Card className="p-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${color.bg} ${color.border} ${color.glow}`}>
                  <Icon size={16} className={color.icon} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-foreground-tertiary font-medium truncate">{def.label}</p>
                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">{Number(value).toLocaleString()}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
