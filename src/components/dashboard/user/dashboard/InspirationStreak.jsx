"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Flame, HelpCircle, X } from "lucide-react";

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);
  const reduced = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  useEffect(() => {
    if (reduced.current) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

export default function InspirationStreak({ streak }) {
  const reduceMotion = useReducedMotion();
  const [showInfo, setShowInfo] = useState(false);

  const current = streak?.current ?? 0;
  const weekActivity = streak?.weekActivity ?? [false, false, false, false, false, false, false];

  const animatedCurrent = useCountUp(current);

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Circular progress calculations (relative to 7-day milestone)
  const radius = 42;
  const strokeWidth = 6;
  const center = 52;
  const circumference = 2 * Math.PI * radius;
  // Dynamic progress: min 0, max 1 based on current streak
  const progressRatio = current > 0 ? Math.min(Math.max(current / 7, 0.08), 1) : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full rounded-2xl bg-card border border-border shadow-xs p-5 sm:p-6 transition-all duration-300"
    >
      {/* 1. Header: Flame + Title (left) and Help button (right) */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-rose-500 sm:w-5 sm:h-5" fill="currentColor" />
          <h3 className="text-[15px] sm:text-[16px] font-semibold text-foreground tracking-tight">
            Inspiration Streak
          </h3>
        </div>

        {/* Help / Info Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Inspiration streak information"
            className="w-6 h-6 rounded-full border border-border/80 text-foreground-tertiary hover:text-foreground hover:bg-muted/50 flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer"
          >
            ?
          </button>

          {/* Info Tooltip/Popup */}
          {showInfo && (
            <div className="absolute right-0 top-8 z-30 w-64 p-3 rounded-xl bg-popover border border-border text-popover-foreground text-xs shadow-lg animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-foreground">How streaks work</span>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-foreground-tertiary hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
              <p className="text-foreground-secondary leading-relaxed">
                Scan your Tag or receive your daily inspiration every day to keep your streak alive and unlock badges!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Body: Left Circular Progress + Right Weekly Streak */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6 sm:gap-10">
        {/* Left: Large Circular Streak Indicator */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width="104"
            height="104"
            viewBox="0 0 104 104"
            className="transform -rotate-90"
          >
            {/* Background Track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/30 dark:text-muted/20"
              fill="none"
            />
            {/* Active Progress Stroke */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-rose-500 transition-all duration-1000 ease-out"
              fill="none"
            />
          </svg>

          {/* Centered Days Counter inside the ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-[30px] sm:text-[34px] font-bold text-foreground leading-none tabular-nums tracking-tight">
              {animatedCurrent}
            </span>
            <span className="text-[11px] sm:text-[12px] text-foreground-secondary font-medium mt-0.5">
              {current === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>

        {/* Right: Weekly Streak Section (Fills remaining horizontal space) */}
        <div className="flex-1 w-full flex flex-col items-center sm:items-start justify-center">
          {/* Motivation Text above days */}
          <p className="text-[13px] sm:text-[14px] font-medium text-foreground-secondary mb-3 text-center sm:text-left">
            {current > 0 ? 'Keep your streak going!' : 'Start your streak today!'}
          </p>

          {/* 7-Day Weekday Row: Distributed evenly across the full weekly area */}
          <div className="grid grid-cols-7 w-full gap-1.5 sm:gap-3 items-center">
            {DAYS.map((day, i) => {
              const active = Boolean(weekActivity[i]);
              return (
                <div key={i} className="flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] sm:text-[13px] font-semibold text-foreground-tertiary select-none">
                    {day}
                  </span>
                  <div
                    className={`w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center border transition-all duration-200 select-none ${
                      active
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:bg-rose-500/25 dark:text-rose-400 dark:border-rose-500/50 shadow-2xs'
                        : 'bg-card border-border/80 text-transparent dark:bg-muted/10'
                    }`}
                  >
                    {active && <Check size={15} strokeWidth={2.5} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
