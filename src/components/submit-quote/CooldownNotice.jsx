'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * Live cooldown countdown for quote submissions.
 *
 * Counts down from the backend-provided `cooldownEndsAt` timestamp (absolute,
 * timezone-safe). When it reaches zero, `onCooldownEnd` fires so the parent
 * can revalidate eligibility without a page refresh.
 *
 * Format: "6d 23h 42m" (days omitted when 0, hours omitted when 0).
 */
export default function CooldownNotice({ cooldownEndsAt, plan, onCooldownEnd }) {
  const [now, setNow] = useState(() => Date.now());

  const endTime = useMemo(() => {
    const t = cooldownEndsAt ? new Date(cooldownEndsAt).getTime() : null;
    return t && !Number.isNaN(t) ? t : null;
  }, [cooldownEndsAt]);

  const remainingMs = endTime ? Math.max(endTime - now, 0) : 0;

  // Tick every second while a cooldown is active.
  useEffect(() => {
    if (!endTime) return undefined;
    const timer = setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= endTime) {
        clearInterval(timer);
        onCooldownEnd?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, onCooldownEnd]);

  const parts = useMemo(() => {
    if (remainingMs <= 0) return [];
    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const out = [];
    if (days > 0) out.push(`${days}d`);
    if (hours > 0 || days > 0) out.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) out.push(`${minutes}m`);
    out.push(`${seconds}s`);
    return out;
  }, [remainingMs]);

  const limitLabel = plan === 'subscriber'
    ? 'You can submit 1 quote per day.'
    : 'You can submit 1 quote every 7 days.';

  return (
    <div className="w-full rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-5 text-center">
      <div className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-[12px] font-medium text-amber-600 dark:text-amber-400">
        <Clock size={13} />
        {limitLabel}
      </div>

      <p className="mt-4 text-sm text-foreground-secondary">
        Your next quote submission is available in
      </p>

      <p
        className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground tabular-nums"
        aria-live="polite"
      >
        {remainingMs > 0 ? parts.join(' ') : '0s'}
      </p>
    </div>
  );
}
