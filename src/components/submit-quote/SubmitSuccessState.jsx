'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CooldownNotice from './CooldownNotice';

/**
 * Premium post-submission success state.
 *
 * The user has just created a submission, so the cooldown is active.
 * "Write Another Quote" is replaced by the live cooldown notice — the
 * submission form must not be reachable while the cooldown is running.
 */
export default function SubmitSuccessState({ cooldownEndsAt, plan, onCooldownEnd }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md py-10 text-center"
    >
      {/* Glowing success icon */}
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="absolute inset-0 animate-pulse rounded-full border-2 border-emerald-500/10" />
      </div>

      <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">
        Quote Submitted Successfully
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-foreground-tertiary">
        Your quote is now under review. Our team will make sure it meets our
        community guidelines before publishing.
      </p>

      {/* Review notice */}
      <div className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-[12px] font-medium text-amber-500 backdrop-blur-sm">
        <Clock size={13} />
        We&apos;ll notify you once it&apos;s approved.
      </div>

      {/* Live cooldown countdown — the form stays locked until it expires */}
      {cooldownEndsAt && (
        <div className="mt-6">
          <CooldownNotice
            cooldownEndsAt={cooldownEndsAt}
            plan={plan}
            onCooldownEnd={onCooldownEnd}
          />
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/new-dashboard/user/submit-quote/history"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-background-secondary/50 px-6 py-3 text-sm font-medium text-foreground-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:text-foreground active:scale-95 light:border-[#E8DFCE]/70 light:bg-white/70"
        >
          View Submission History
        </Link>
      </div>
    </motion.div>
  );
}
