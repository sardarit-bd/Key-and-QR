'use client';

import { useEffect, useRef, useState } from 'react';
import Card from "./Card";

/**
 * Count-up hook — eases the number up once on mount.
 * Respects prefers-reduced-motion: jumps straight to the value.
 */
function useCountUp(target, duration = 900) {
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
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + (targetNum - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  colorTheme,
  customIconRender,
}) {
  const animatedValue = useCountUp(value);
  const themeMap = {
    purple: {
      border: "border-purple-500/25",
      bg: "bg-gradient-to-br from-purple-500/20 to-purple-500/5",
      icon: "text-purple-400",
      glow: "shadow-[0_0_24px_-4px_rgba(168,85,247,0.25)]",
      ring: "ring-purple-500/20",
    },
    pink: {
      border: "border-pink-500/25",
      bg: "bg-gradient-to-br from-pink-500/20 to-pink-500/5",
      icon: "text-pink-400",
      glow: "shadow-[0_0_24px_-4px_rgba(244,114,182,0.25)]",
      ring: "ring-pink-500/20",
    },
    blue: {
      border: "border-info/25",
      bg: "bg-gradient-to-br from-info/20 to-info/5",
      icon: "text-info",
      glow: "shadow-[0_0_24px_-4px_rgba(140,166,235,0.25)]",
      ring: "ring-info/20",
    },
    gold: {
      border: "border-accent/25",
      bg: "bg-gradient-to-br from-accent/20 to-accent/5",
      icon: "text-accent",
      glow: "shadow-[0_0_24px_-4px_rgba(227,186,133,0.3)]",
      ring: "ring-accent/20",
    },
  };

  const theme = themeMap[colorTheme] || themeMap.purple;

  return (
    <Card className="p-5 sm:p-6 h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgb(0_0_0/0.5)]">
      <div className="flex items-center justify-between gap-4 sm:gap-5">
        <div className={`relative w-[52px] sm:w-[56px] md:w-[60px] h-[52px] sm:h-[56px] md:h-[60px] rounded-2xl border ${theme.border} ${theme.bg} ${theme.glow} ring-1 ${theme.ring} flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105`}>
          {customIconRender ? (
            customIconRender()
          ) : (
            <Icon size={22} className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] ${theme.icon}`} />
          )}
        </div>

        <div className="text-right min-w-0">
          <p className="text-foreground-tertiary text-[11px] sm:text-xs font-medium tracking-wide">
            {title}
          </p>

          <h3 className="text-[26px] sm:text-[30px] md:text-[34px] leading-tight text-foreground font-semibold tracking-tight tabular-nums">
            {animatedValue}
          </h3>

          <p className="text-foreground-tertiary text-[11px] sm:text-xs truncate">
            {subtitle}
          </p>
        </div>
      </div>
    </Card>
  );
}
