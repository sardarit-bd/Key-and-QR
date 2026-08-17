"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle2, Crown, Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-accent mx-auto mb-4" />
            <p className="text-foreground-secondary text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const tagCode = searchParams.get("tagCode");
  const { fetchMySubscriptions } = useSubscriptionStore();
  const { checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refresh = async () => {
      try {
        await Promise.allSettled([
          fetchMySubscriptions(),
          checkAuth ? checkAuth() : Promise.resolve(),
        ]);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    refresh();
  }, [fetchMySubscriptions, checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-accent mx-auto mb-4" />
          <p className="text-foreground text-base font-medium">Confirming your subscription...</p>
          <p className="text-foreground-tertiary text-xs mt-1">Activating all premium benefits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative max-w-md w-full overflow-hidden rounded-[28px] border border-white/10 bg-card p-8 sm:p-10 shadow-2xl text-center"
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-[0_0_24px_-4px_rgba(52,211,153,0.35)]">
            <CheckCircle2 size={36} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent mb-3">
            <Sparkles size={12} />
            Premium Activated
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            You&apos;re now a Premium member!
          </h1>
          <p className="text-foreground-secondary text-sm leading-relaxed mb-6">
            Your unlimited quotes, full category explorer, and premium ad-free experience are now active.
          </p>

          {tagCode && (
            <div className="rounded-xl border border-white/8 bg-background-secondary/50 p-3.5 mb-6 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
              <Crown size={14} className="text-accent" />
              <span>Tag Code: <strong className="text-foreground font-mono">{tagCode}</strong> is now Premium</span>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/new-dashboard/user/premium"
              className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-accent to-accent/85 text-accent-foreground rounded-full text-sm font-semibold shadow-[0_8px_24px_-8px_rgba(253,182,92,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(253,182,92,0.6)] active:scale-95"
            >
              <span>View Membership Details</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/new-dashboard/user"
              className="block w-full py-2.5 px-4 rounded-full border border-white/10 bg-background-secondary/40 text-foreground-secondary text-xs font-medium transition-all hover:bg-background-secondary hover:text-foreground active:scale-95"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

