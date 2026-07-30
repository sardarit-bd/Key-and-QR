'use client';

import { motion } from 'framer-motion';
import { Activity, ShoppingBag, UserPlus, Quote, QrCode, CreditCard, DollarSign, RotateCcw, Check } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const ACTIVITY_ICONS = {
  order_created:        { icon: ShoppingBag, color: 'text-blue-400',   bg: 'bg-blue-500/10 border border-blue-500/20' },
  user_registered:      { icon: UserPlus,     color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20' },
  quote_submitted:      { icon: Quote,        color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/20' },
  tag_activated:        { icon: QrCode,       color: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20' },
  subscription_upgraded:{ icon: CreditCard,   color: 'text-teal-400',   bg: 'bg-teal-500/10 border border-teal-500/20' },
  order_paid:           { icon: DollarSign,   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border border-emerald-500/20' },
  refund_processed:     { icon: RotateCcw,    color: 'text-red-400',    bg: 'bg-red-500/10 border border-red-500/20' },
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ActivityRow({ activity }) {
  const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.order_created;
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-2.5 px-1 hover:bg-muted/30 rounded-lg transition-colors">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
        <Icon size={15} className={config.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground truncate">{activity.message}</p>
        <p className="text-xs text-foreground-tertiary truncate">{activity.details}</p>
      </div>
      <span className="text-[11px] text-foreground-tertiary flex-shrink-0 mt-0.5">
        {timeAgo(activity.createdAt)}
      </span>
    </div>
  );
}

export default function AdminRecentActivity({ activity = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Activity size={18} className="text-purple-400" />
          Recent Activity
        </h2>

        {activity.length === 0 ? (
          <div className="py-10 text-center">
            <Activity size={36} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-foreground-tertiary">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {activity.map((a) => (
              <ActivityRow key={a._id} activity={a} />
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
