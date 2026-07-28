'use client';

import { motion } from 'framer-motion';
import { Package, Tag, ShoppingBag, Users, Quote as QuoteIcon, BarChart3 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

const ACTION_ICONS = {
  'add-product':    Package,
  'create-tag':     Tag,
  'view-orders':    ShoppingBag,
  'manage-users':   Users,
  'review-quotes':  QuoteIcon,
  'analytics':      BarChart3,
};

const ACTION_COLORS = [
  'text-indigo-400  bg-indigo-500/10  border-indigo-500/20',
  'text-blue-400    bg-blue-500/10    border-blue-500/20',
  'text-teal-400    bg-teal-500/10    border-teal-500/20',
  'text-amber-400   bg-amber-500/10   border-amber-500/20',
  'text-purple-400  bg-purple-500/10  border-purple-500/20',
  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
];

export default function AdminQuickActions({ actions = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-teal-400" />
          Quick Actions
        </h2>

        {actions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-foreground-tertiary">No actions available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {actions.map((action, i) => {
              const Icon = ACTION_ICONS[action.icon] || Package;
              const color = ACTION_COLORS[i % ACTION_COLORS.length];

              return (
                <Link key={action.id} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-colors cursor-pointer ${color}`}
                  >
                    <Icon size={20} />
                    <span className="text-[11px] sm:text-xs font-medium text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
