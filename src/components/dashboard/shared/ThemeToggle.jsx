'use client';

import { useState } from 'react';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modern High-Performance Pill Theme Toggle
 * - 60 FPS GPU-accelerated spring transitions
 * - Rotational scaling & icon morphing micro-interactions
 * - Passes origin click coordinates to ThemeProvider for full-screen ripple mask
 * - Accessible with ARIA switch roles and keyboard triggers
 */
export default function ThemeToggle({ className }) {
  const { themeMode, toggleTheme, isMounted } = useTheme();
  const isThemeDark = themeMode === 'dark';
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = (e) => {
    // Determine the transition origin coordinates from click or element center
    let coords = null;
    if (e) {
      if (typeof e.clientX === 'number' && typeof e.clientY === 'number' && (e.clientX > 0 || e.clientY > 0)) {
        coords = { x: e.clientX, y: e.clientY };
      } else if (e.currentTarget && typeof e.currentTarget.getBoundingClientRect === 'function') {
        const rect = e.currentTarget.getBoundingClientRect();
        coords = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    }

    toggleTheme(coords);
  };

  // Hydration skeleton placeholder to prevent layout shift
  if (!isMounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-7 w-14 items-center rounded-full border border-neutral-300/40 bg-neutral-200/60 p-1 dark:border-neutral-700/60 dark:bg-neutral-800/60 opacity-60 shrink-0",
          className
        )}
      >
        <div className="h-5 w-5 rounded-full bg-white/80 shadow-xs" />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isThemeDark}
      aria-label="Toggle theme"
      title={`Switch to ${isThemeDark ? 'Light' : 'Dark'} Mode`}
      onClick={handleToggle}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "group relative inline-flex h-7 w-14 cursor-pointer select-none items-center rounded-full p-1 shrink-0",
        "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        "active:scale-95 hover:brightness-105",
        isThemeDark
          ? "border border-indigo-500/40 bg-gradient-to-r from-slate-950 via-[#161244] to-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_12px_rgba(99,102,241,0.2)]"
          : "border border-amber-300/80 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_12px_rgba(245,158,11,0.2)]",
        className
      )}
    >
      {/* Background Track Icons & Atmospheric Details */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-xs overflow-hidden rounded-full">
        {/* Left slot: Moon (glows softly in light mode) */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300 ease-out",
            isThemeDark ? "opacity-0 scale-75 -translate-x-1" : "opacity-75 scale-100 translate-x-0"
          )}
        >
          <Moon className="h-3.5 w-3.5 text-amber-800/60" strokeWidth={2.2} />
        </div>

        {/* Right slot: Sun in dark mode */}
        <div
          className={cn(
            "flex items-center justify-center transition-all duration-300 ease-out",
            isThemeDark ? "opacity-75 scale-100 translate-x-0" : "opacity-0 scale-75 translate-x-1"
          )}
        >
          <Sun className="h-3.5 w-3.5 text-indigo-300/70" strokeWidth={2.2} />
        </div>
      </div>

      {/* Floating Animated Sliding Thumb */}
      <div
        className={cn(
          "relative z-10 flex h-5 w-5 items-center justify-center rounded-full will-change-transform",
          "transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)",
          isPressed && "scale-90",
          isThemeDark
            ? "translate-x-0 bg-gradient-to-b from-white to-slate-100 shadow-[0_0_14px_rgba(168,85,247,0.55),0_2px_4px_rgba(0,0,0,0.4)]"
            : "translate-x-7 bg-gradient-to-b from-amber-50 to-white shadow-[0_0_14px_rgba(245,158,11,0.65),0_2px_4px_rgba(0,0,0,0.15)]"
        )}
      >
        {/* Dark Mode Icon: Moon with smooth rotation & scale */}
        <Moon
          className={cn(
            "absolute h-3 w-3 text-indigo-950 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)",
            isThemeDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          )}
          strokeWidth={2.5}
        />

        {/* Light Mode Icon: Sun with smooth rotation & scale */}
        <Sun
          className={cn(
            "absolute h-3 w-3 text-amber-500 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)",
            isThemeDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          )}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}
