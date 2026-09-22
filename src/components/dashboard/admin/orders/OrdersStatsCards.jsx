'use client';

import { motion } from 'framer-motion';
import {
  ShoppingBag, Clock, Tag, Truck, PackageCheck, Ban,
  RotateCcw, CreditCard, DollarSign
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATS_DEFS = [
  { key: 'total', label: 'Total Orders', icon: ShoppingBag, color: 'neutral' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
  { key: 'assigned', label: 'Assigned', icon: Tag, color: 'blue' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'teal' },
  { key: 'delivered', label: 'Delivered', icon: PackageCheck, color: 'emerald' },
  { key: 'cancelled', label: 'Cancelled', icon: Ban, color: 'red' },
  { key: 'returned', label: 'Returned', icon: RotateCcw, color: 'slate' },
  { key: 'paid', label: 'Paid', icon: CreditCard, color: 'emerald' },
  { key: 'refunded', label: 'Refunded', icon: DollarSign, color: 'red' },
];

const COLOR_MAP = {
  neutral: { border: 'border-border', bg: 'bg-card', icon: 'text-foreground' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  red:     { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  slate:   { border: 'border-border', bg: 'bg-muted', icon: 'text-muted-foreground' },
  teal:    { border: 'border-teal-500/30', bg: 'bg-teal-500/10', icon: 'text-teal-400' },
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
              <div className="flex items-center justify-between gap-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${color.bg} ${color.border} ${color.glow}`}>
                  <Icon size={16} className={color.icon} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[10px] text-foreground-tertiary font-medium truncate">{def.label}</p>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight truncate">{Number(value).toLocaleString()}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
