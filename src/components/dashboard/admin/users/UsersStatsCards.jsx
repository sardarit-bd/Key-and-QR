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
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'indigo' },
  { key: 'activeUsers', label: 'Active', icon: UserCheck, color: 'emerald' },
  { key: 'suspendedUsers', label: 'Suspended', icon: UserX, color: 'red' },
  { key: 'newToday', label: 'New Today', icon: UserPlus, color: 'blue' },
  { key: 'adminCount', label: 'Admins', icon: Shield, color: 'purple' },
  { key: 'moderatorCount', label: 'Moderators', icon: ShieldHalf, color: 'teal' },
];

const COLOR_MAP = {
  indigo:  { border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', icon: 'text-indigo-400', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]' },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
  red:     { border: 'border-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
  blue:    { border: 'border-blue-500/30', bg: 'bg-blue-500/10', icon: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
  purple:  { border: 'border-purple-500/30', bg: 'bg-purple-500/10', icon: 'text-purple-400', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
  teal:    { border: 'border-teal-500/30', bg: 'bg-teal-500/10', icon: 'text-teal-400', glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]' },
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
