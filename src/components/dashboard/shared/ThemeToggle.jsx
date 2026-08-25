'use client';

import { useState, useEffect, startTransition } from 'react';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modern High-Performance Framer-Style Pill Toggle Switch
 * - 60 FPS GPU-accelerated transform transitions
 * - Optimistic local state decoupled from global theme re-renders
 * - Non-blocking startTransition for instant visual response
 */
export default function ThemeToggle({ className }) {
  const { themeMode, toggleTheme, isMounted } = useTheme();
  const isThemeDark = themeMode === 'dark';

  // Optimistic local state for 0ms instant animation response
  const [localDark, setLocalDark] = useState(isThemeDark);

  // Sync local state when external theme changes
  useEffect(() => {
    setLocalDark(isThemeDark);
  }, [isThemeDark]);

  const handleToggle = () => {
    const nextDark = !localDark;
    // 1. Instantly trigger local GPU transition
    setLocalDark(nextDark);

    // 2. Defer heavy global root DOM re-render to background priority
    startTransition(() => {
      toggleTheme();
    });
  };

  // Prevent hydration mismatch by rendering a skeleton pill until mounted
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
      aria-checked={localDark}
      aria-label="Toggle theme"
      title={`Switch to ${localDark ? 'Light' : 'Dark'} Mode`}
      onClick={handleToggle}
      className={cn(
        "group relative inline-flex h-7 w-14 cursor-pointer select-none items-center rounded-full p-1 shrink-0 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-95",
        localDark
          ? "border border-indigo-800/60 bg-[#1e1b4b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
          : "border border-emerald-300/80 bg-emerald-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Background Track Icons */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-xs">
        {/* Left slot: Moon (visible in light mode behind dark thumb position) */}
        <Moon
          className={cn(
            "h-3.5 w-3.5 transition-opacity duration-200 ease-out",
            localDark ? "opacity-0 pointer-events-none" : "text-emerald-800/45 opacity-100"
          )}
          strokeWidth={2.2}
        />
        {/* Right slot: Sun (visible in dark mode behind light thumb position) */}
        <Sun
          className={cn(
            "h-3.5 w-3.5 transition-opacity duration-200 ease-out",
            localDark ? "text-indigo-300/50 opacity-100" : "opacity-0 pointer-events-none"
          )}
          strokeWidth={2.2}
        />
      </div>

      {/* Sliding Thumb (Pure GPU translate3d with cubic-bezier spring easing) */}
      <div
        className={cn(
          "relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white will-change-transform transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          localDark
            ? "translate-x-0 shadow-[0_0_14px_rgba(168,85,247,0.55),0_2px_4px_rgba(0,0,0,0.4)]"
            : "translate-x-7 shadow-[0_0_12px_rgba(52,211,153,0.65),0_2px_4px_rgba(0,0,0,0.15)]"
        )}
      >
        <Moon
          className={cn(
            "absolute h-3 w-3 text-indigo-950 transition-all duration-200 ease-out",
            localDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          )}
          strokeWidth={2.5}
        />
        <Sun
          className={cn(
            "absolute h-3 w-3 text-amber-500 transition-all duration-200 ease-out",
            localDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          )}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}

