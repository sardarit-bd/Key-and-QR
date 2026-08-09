"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Flame } from "lucide-react";

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
  const current = streak?.current ?? 0;
  const longest = streak?.longest ?? 0;
  const weekActivity = streak?.weekActivity ?? [false, false, false, false, false, false, false];
  const weekDates = streak?.weekDates ?? [];

  const animatedCurrent = useCountUp(current);

  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const dayLabel = (dateStr, fallbackIndex) => {
    if (!dateStr) return DAYS[fallbackIndex] || '';
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return DAYS[fallbackIndex] || '';
    const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return WEEKDAY_LETTERS[d.getUTCDay()];
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl bg-card border border-border shadow-sm p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Flame size={18} className="text-accent" fill="currentColor" />
        <h3 className="text-[15px] sm:text-[16px] font-semibold text-foreground">
          Inspiration Streak
        </h3>
        {longest > 0 && (
          <span className="ml-auto text-[12px] font-medium text-foreground-tertiary">
            Best: {longest}
          </span>
        )}
      </div>

      {/* Days count */}
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-[48px] sm:text-[56px] leading-none font-semibold tracking-tight text-foreground tabular-nums">
          {animatedCurrent}
        </span>
        <span className="text-[16px] sm:text-[18px] text-foreground-secondary font-medium">
          {current === 1 ? 'Day' : 'Days'}
        </span>
      </div>

      {/* Day dots */}
      <div className="flex justify-between items-center gap-1">
        {DAYS.map((day, i) => {
          const active = weekActivity[i];
          return (
            <motion.div
              key={i}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
              className="flex flex-col items-center gap-1.5 sm:gap-2"
            >
              <div
                className={`
                  flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2
                  transition-colors duration-200
                  ${
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-transparent text-foreground-tertiary"
                  }
                `}
              >
                {active ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-[12px] sm:text-[13px] font-medium">{day}</span>
                )}
              </div>
              <span className="text-[11px] sm:text-[12px] text-foreground-tertiary font-medium">
                {dayLabel(weekDates[i], i)}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Encouragement */}
      <p className="mt-5 text-center text-[13px] text-foreground-tertiary">
        {current > 0
          ? 'Keep your streak going!'
          : 'Start your streak today!'}
      </p>
    </motion.div>
  );
}
