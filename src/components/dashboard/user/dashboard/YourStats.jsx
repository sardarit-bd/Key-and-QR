'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Quote, Heart, BookOpen, QrCode, RefreshCw } from 'lucide-react';

function useCountUpStatic(target) {
  return String(target ?? 0);
}

function StatTile({ icon: Icon, value, label, colorClass = 'text-accent' }) {
  const displayValue = useCountUpStatic(value);

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 hover:bg-background-secondary/30 transition-colors duration-150">
      <span className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-background-secondary ${colorClass}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[18px] sm:text-[20px] leading-none font-semibold text-foreground tabular-nums">
          {displayValue}
        </p>
        <p className="text-[11px] sm:text-[12px] text-foreground-tertiary mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

/** Premium-locked placeholder shown to free users. */
function YourStatsLocked() {
  return (
    <div className="w-full rounded-2xl border border-rose-500/20 bg-card/60 backdrop-blur-sm overflow-hidden">
      <button
        disabled
        aria-expanded={false}
        className="w-full flex items-center justify-between px-5 py-4 sm:py-5 cursor-not-allowed text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/25">
            <Heart size={14} className="text-rose-400" />
          </span>
          <span className="text-[15px] sm:text-[16px] font-semibold text-foreground-tertiary/70">
            Your Stats
          </span>
        </div>
      </button>
      <div className="px-5 pb-5 pt-1">
        <p className="text-sm text-foreground-tertiary/60 mb-4">
          Available with MyInspire+
        </p>
        <a
          href="/dashboard/user/premium"
          className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-[13px] font-medium text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
        >
          Unlock MyInspire+
        </a>
      </div>
    </div>
  );
}

export default function YourStats({ statistics, isPremium }) {
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  if (!isPremium) return <YourStatsLocked />;

  const stats = [
    { id: 'quotes', icon: Quote, value: statistics?.totalQuotes ?? 0, label: 'Received', colorClass: 'text-violet-400' },
    { id: 'favorites', icon: Heart, value: statistics?.favorites ?? 0, label: 'Saved', colorClass: 'text-rose-400' },
    { id: 'scans', icon: QrCode, value: statistics?.scans ?? 0, label: 'Scans', colorClass: 'text-blue-400' },
    { id: 'gifted', icon: BookOpen, value: statistics?.tags ?? 0, label: 'Gifted', colorClass: 'text-accent' },
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls="your-stats-panel"
        className="w-full flex items-center justify-between px-5 py-4 sm:py-5 cursor-pointer text-left hover:bg-background-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 border border-accent/25">
            <RefreshCw size={14} className="text-accent" />
          </span>
          <span className="text-[15px] sm:text-[16px] font-semibold text-foreground">
            Your Stats
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-foreground-tertiary" />
        </motion.span>
      </button>

      <div
        id="your-stats-panel"
        className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border border-t border-border">
          {stats.map((stat) => (
            <StatTile key={stat.id} {...stat} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
