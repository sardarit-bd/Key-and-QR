'use client';

import { motion } from 'framer-motion';
import { QrCode, CheckCircle, Clock, Ban, Users, UserX, Tag } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATS_DEFS = [
  { key: 'total', label: 'Total', icon: QrCode, color: 'indigo' },
  { key: 'activated', label: 'Activated', icon: CheckCircle, color: 'emerald' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'amber' },
  { key: 'disabled', label: 'Disabled', icon: Ban, color: 'red' },
  { key: 'assigned', label: 'Assigned', icon: Users, color: 'blue' },
  { key: 'unassigned', label: 'Unassigned', icon: UserX, color: 'teal' },
  { key: 'free', label: 'Free Plan', icon: Tag, color: 'purple' },
  { key: 'subscriber', label: 'Subscriber', icon: Tag, color: 'amber' },
];

const C = {
  indigo:  { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: 'text-indigo-400' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  red:     { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400' },
  teal:    { border: 'border-teal-500/30', bg: 'bg-teal-500/10', icon: 'text-teal-400' },
  purple:  { border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: 'text-purple-400' },
};

export default function TagsStatsCards({ stats = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3"
    >
      {STATS_DEFS.map((def, i) => {
        const Icon = def.icon;
        const c = C[def.color];
        const value = stats[def.key] ?? 0;
        return (
          <motion.div key={def.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
            <Card className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.border}`}>
                  <Icon size={16} className={c.icon} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[10px] text-foreground-tertiary font-medium truncate">{def.label}</p>
                  <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{Number(value).toLocaleString()}</h3>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
