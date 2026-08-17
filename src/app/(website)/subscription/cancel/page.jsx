"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative max-w-md w-full overflow-hidden rounded-[28px] border border-white/10 bg-card p-8 sm:p-10 shadow-2xl text-center"
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_24px_-4px_rgba(251,191,36,0.35)]">
            <RefreshCw size={32} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            Upgrade Incomplete
          </h1>
          <p className="text-foreground-secondary text-sm leading-relaxed mb-6">
            Your subscription wasn&apos;t completed and no charges were made. You can upgrade whenever you&apos;re ready.
          </p>

          <div className="space-y-3">
            <Link
              href="/new-dashboard/user/premium"
              className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-accent to-accent/85 text-accent-foreground rounded-full text-sm font-semibold shadow-[0_8px_24px_-8px_rgba(253,182,92,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.6)] active:scale-95"
            >
              <span>Back to Membership</span>
            </Link>
            <Link
              href="/new-dashboard/user"
              className="flex w-full items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-white/10 bg-background-secondary/40 text-foreground-secondary text-xs font-medium transition-all hover:bg-background-secondary hover:text-foreground active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}