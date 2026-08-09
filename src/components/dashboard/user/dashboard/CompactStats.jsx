'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Quote, Heart, QrCode, Gift } from 'lucide-react';

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }, []);

  useEffect(() => {
    const targetNum = Number(target) || 0;
    if (reduced.current) {
      setValue(targetNum);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (targetNum - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

function StatItem({ icon: Icon, value, label }) {
  const animatedValue = useCountUp(String(value));

  return (
    <div className="flex items-center gap-3 p-3 sm:p-4">
      <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-background-secondary text-accent">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[18px] sm:text-[20px] leading-none font-semibold text-foreground tabular-nums">
          {animatedValue}
        </p>
        <p className="text-[11px] sm:text-[12px] text-foreground-tertiary mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function CompactStats({ statistics }) {
  const reduceMotion = useReducedMotion();

  const stats = [
    { id: 'quotes', icon: Quote, value: statistics?.totalQuotes ?? 0, label: 'Quotes' },
    { id: 'favorites', icon: Heart, value: statistics?.favorites ?? 0, label: 'Favorites' },
    { id: 'scans', icon: QrCode, value: statistics?.scans ?? 0, label: 'Scans' },
    { id: 'gifted', icon: Gift, value: statistics?.tags ?? 0, label: 'Gifted' },
  ];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl bg-card border border-border shadow-sm overflow-hidden"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border">
        {stats.map((stat) => (
          <StatItem key={stat.id} {...stat} />
        ))}
      </div>
    </motion.div>
  );
}
