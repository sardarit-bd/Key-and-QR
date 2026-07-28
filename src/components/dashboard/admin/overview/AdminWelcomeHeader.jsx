'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminWelcomeHeader() {
  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
            <Shield size={20} className="text-primary" />
          </span>
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-foreground-secondary mt-2 ml-[52px]">
          Here&apos;s what&apos;s happening across your platform today.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-foreground-tertiary bg-card rounded-xl px-4 py-2 border border-border">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        System Online
      </div>
    </motion.div>
  );
}
