'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Clock, CreditCard, Package, Quote, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';
import Link from 'next/link';

export default function AdminActionRequired({ actionRequired = {} }) {
  const {
    pendingOrdersCount = 0,
    failedPaymentsCount = 0,
    lowStockCount = 0,
    pendingQuotesCount = 0,
    hasAlerts = false,
  } = actionRequired;

  if (!hasAlerts) {
    return (
      <Card className="p-4 sm:p-5 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">All Systems & Operations Clear</h3>
            <p className="text-xs text-foreground-secondary">
              No pending orders, failed payments, or quote moderation backlogs requiring immediate attention.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const alerts = [
    pendingOrdersCount > 0 && {
      title: `${pendingOrdersCount} Pending Orders`,
      description: 'Orders awaiting fulfillment or tag assignment',
      href: '/dashboard/admin/orders',
      btnText: 'Fulfill Orders',
      icon: Clock,
      color: 'amber',
    },
    failedPaymentsCount > 0 && {
      title: `${failedPaymentsCount} Failed Payments`,
      description: 'Transactions that need customer follow-up',
      href: '/dashboard/admin/orders',
      btnText: 'Inspect Orders',
      icon: CreditCard,
      color: 'rose',
    },
    lowStockCount > 0 && {
      title: `${lowStockCount} Inventory Alerts`,
      description: 'Products that are out of stock or low in inventory',
      href: '/dashboard/admin/products',
      btnText: 'Restock Products',
      icon: Package,
      color: 'amber',
    },
    pendingQuotesCount > 0 && {
      title: `${pendingQuotesCount} Quotes Awaiting Review`,
      description: 'User quote submissions waiting for moderation',
      href: '/dashboard/admin/quotes/pending',
      btnText: 'Moderate Quotes',
      icon: Quote,
      color: 'purple',
    },
  ].filter(Boolean);

  const COLOR_MAP = {
    amber:  { bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: 'text-amber-400', btn: 'bg-amber-500 text-black hover:bg-amber-400' },
    rose:   { bg: 'bg-rose-500/10',  border: 'border-rose-500/25',  icon: 'text-rose-400',  btn: 'bg-rose-500 text-white hover:bg-rose-600' },
    purple: { bg: 'bg-purple-500/10',border: 'border-purple-500/25',icon: 'text-purple-400',btn: 'bg-purple-500 text-white hover:bg-purple-600' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-amber-400" />
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider text-xs">Action Required</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {alerts.map((alert, i) => {
          const Icon = alert.icon;
          const style = COLOR_MAP[alert.color] || COLOR_MAP.amber;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card className={`p-4 border ${style.border} ${style.bg} flex flex-col justify-between h-full`}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-background/50 flex items-center justify-center shrink-0">
                    <Icon size={16} className={style.icon} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{alert.title}</h4>
                    <p className="text-[11px] text-foreground-secondary leading-snug mt-0.5">{alert.description}</p>
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border/40 flex items-center justify-end">
                  <Link
                    href={alert.href}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm ${style.btn}`}
                  >
                    {alert.btnText} <ArrowRight size={12} />
                  </Link>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
