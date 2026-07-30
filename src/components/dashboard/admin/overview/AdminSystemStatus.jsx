'use client';

import { motion } from 'framer-motion';
import { Server, Database, CreditCard, Mail, HardDrive } from 'lucide-react';
import Card from '@/components/dashboard/user/dashboard/Card';

const STATUS_CONFIG = {
  api:      { label: 'API',         icon: Server },
  database: { label: 'Database',    icon: Database },
  stripe:   { label: 'Stripe',      icon: CreditCard },
  email:    { label: 'Email',       icon: Mail },
  storage:  { label: 'Storage',     icon: HardDrive },
};

function StatusRow({ serviceKey, data }) {
  const config = STATUS_CONFIG[serviceKey];
  if (!config) return null;

  const Icon = config.icon;
  const isHealthy = data.status === 'healthy';
  const dotColor = isHealthy ? 'bg-emerald-400' : 'bg-red-400';
  const dotPulse = isHealthy ? 'animate-pulse' : '';

  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
          <Icon size={15} className="text-foreground-tertiary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{config.label}</p>
          <p className="text-[11px] text-foreground-tertiary">
            {data.latency} latency
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {data.usage && (
          <span className="text-[11px] text-foreground-tertiary">{data.usage}</span>
        )}
        <span className={`w-2 h-2 rounded-full ${dotColor} ${dotPulse}`} />
      </div>
    </div>
  );
}

export default function AdminSystemStatus({ systemStatus }) {
  if (!systemStatus || Object.keys(systemStatus).length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Server size={18} className="text-emerald-400" />
            System Status
          </h2>
          <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            All Systems Operational
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {Object.entries(systemStatus).map(([key, data]) => (
            <StatusRow key={key} serviceKey={key} data={data} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
