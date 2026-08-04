'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Layers, Clock, Sparkles } from 'lucide-react';

const STAT_THEMES = {
  rose: { border: 'border-rose-500/25', iconBg: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5', iconColor: 'text-rose-400', glow: 'shadow-[0_0_24px_-4px_rgba(251,113,133,0.25)]', wash: 'bg-gradient-to-br from-rose-500/[0.06] via-transparent to-transparent', ring: 'ring-rose-500/20' },
  violet: { border: 'border-violet-500/25', iconBg: 'bg-gradient-to-br from-violet-500/20 to-violet-500/5', iconColor: 'text-violet-400', glow: 'shadow-[0_0_24px_-4px_rgba(167,139,250,0.25)]', wash: 'bg-gradient-to-br from-violet-500/[0.06] via-transparent to-transparent', ring: 'ring-violet-500/20' },
  emerald: { border: 'border-emerald-500/25', iconBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', glow: 'shadow-[0_0_24px_-4px_rgba(52,211,153,0.25)]', wash: 'bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent', ring: 'ring-emerald-500/20' },
  blue: { border: 'border-blue-500/25', iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', glow: 'shadow-[0_0_24px_-4px_rgba(96,165,250,0.25)]', wash: 'bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent', ring: 'ring-blue-500/20' },
};

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => { const p = Math.min((now - start) / duration, 1); setValue(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) frame.current = requestAnimationFrame(tick); };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

function StatCard({ stat }) {
  const count = useCountUp(stat.value);
  const theme = stat.theme;
  const Icon = stat.icon;
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/6 bg-card p-5 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)] light:border-[#E8DFCE]/80 light:bg-[#FBF7EF]/55 light:shadow-[0_20px_50px_-20px_rgba(100,72,24,0.28),0_10px_30px_-18px_rgba(100,72,24,0.16)]">
      <div className={`pointer-events-none absolute inset-0 ${theme.wash}`} />
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${theme.border} ${theme.iconBg} ${theme.glow} ring-1 ${theme.ring} transition-transform duration-300 group-hover:scale-105`}>
          <Icon className={`h-5 w-5 ${theme.iconColor}`} strokeWidth={1.9} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-foreground-tertiary">{stat.label}</p>
          <h3 className="mt-0.5 text-[26px] font-semibold leading-tight tracking-tight text-foreground tabular-nums sm:text-[30px]">{count}</h3>
          <p className="mt-0.5 text-[11px] text-foreground-tertiary">{stat.sub}</p>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesStats({ stats }) {
  const statConfig = [
    { label: 'Total Favorites', value: stats?.total || 0, sub: 'Saved quotes', icon: Heart, theme: STAT_THEMES.rose },
    { label: 'Categories', value: stats?.categories || 0, sub: 'Different themes', icon: Layers, theme: STAT_THEMES.emerald },
    { label: 'Recently Saved', value: stats?.recently || 0, sub: 'This week', icon: Clock, theme: STAT_THEMES.blue },
    { label: 'Collections', value: stats?.collections || 1, sub: 'Your library', icon: Sparkles, theme: STAT_THEMES.violet },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statConfig.map((stat, idx) => <StatCard key={idx} stat={stat} />)}
    </div>
  );
}
