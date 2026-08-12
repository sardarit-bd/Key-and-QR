'use client';

import { Layers, CheckCircle2, XCircle, Star } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

function StatCard({ icon: Icon, label, value, iconClass = 'text-primary', bgClass = 'bg-primary/10 border-primary/20' }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${bgClass}`}>
        <Icon size={18} className={iconClass} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[11px] text-foreground-tertiary truncate">{label}</p>
      </div>
    </Card>
  );
}

export default function CategoryStatsCards({ categories = [], total = 0, counts = {} }) {
  const active = categories.filter((c) => c.isActive).length;
  const inactive = categories.filter((c) => !c.isActive).length;
  const premium = categories.filter((c) => c.isPremium).length;
  const totalQuotes = Object.values(counts || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={Layers} label="Total Categories" value={total} />
      <StatCard icon={CheckCircle2} label="Active" value={active} iconClass="text-emerald-400" bgClass="bg-emerald-500/10 border-emerald-500/20" />
      <StatCard icon={XCircle} label="Inactive" value={inactive} iconClass="text-amber-400" bgClass="bg-amber-500/10 border-amber-500/20" />
      <StatCard icon={Star} label="Quotes Across Categories" value={totalQuotes} iconClass="text-indigo-400" bgClass="bg-indigo-500/10 border-indigo-500/20" />
    </div>
  );
}
