'use client';

import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  ShieldHalf,
} from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATS_DEFS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'neutral' },
  { key: 'activeUsers', label: 'Active', icon: UserCheck, color: 'emerald' },
  { key: 'suspendedUsers', label: 'Suspended', icon: UserX, color: 'red' },
  { key: 'newToday', label: 'New Today', icon: UserPlus, color: 'blue' },
  { key: 'adminCount', label: 'Admins', icon: Shield, color: 'amber' },
  { key: 'moderatorCount', label: 'Moderators', icon: ShieldHalf, color: 'teal' },
];

const COLOR_MAP = {
  neutral: { border: 'border-border', bg: 'bg-card', icon: 'text-foreground' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400' },
  red:     { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400' },
  amber:   { border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400' },
  teal:    { border: 'border-teal-500/30', bg: 'bg-teal-500/10', icon: 'text-teal-400' },
};

export default function UsersStatsCards({ stats = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
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
            <Card className="p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-2.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color.bg} ${color.border} ${color.glow}`}
                >
                  <Icon size={18} className={`${color.icon}`} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-foreground-tertiary font-medium truncate">
                    {def.label}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight truncate">
                    {Number(value).toLocaleString('en-US')}
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
