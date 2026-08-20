'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import DateRangeDropdown from './DateRangeDropdown';

export default function AdminWelcomeHeader({ selectedRange = '30d', onRangeChange }) {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
            <Shield size={20} className="text-primary" />
          </span>
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-foreground-secondary mt-1.5 ml-[52px]">
          Here&apos;s real-time performance and operational insights across your business.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
        {/* Custom Accessible Date Range Dropdown */}
        <DateRangeDropdown selectedRange={selectedRange} onRangeChange={onRangeChange} />

        {/* System Online Badge */}
        <div className="flex items-center gap-2 text-xs font-medium text-foreground-secondary bg-card rounded-xl px-3.5 py-2.5 border border-border shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          System Online
        </div>
      </div>
    </motion.div>
  );
}
