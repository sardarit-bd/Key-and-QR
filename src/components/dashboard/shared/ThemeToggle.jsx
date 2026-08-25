'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modern Framer-style pill toggle switch for dark/light theme switching.
 */
export default function ThemeToggle({ className }) {
  const { themeMode, toggleTheme, isMounted } = useTheme();

  const isDark = themeMode === 'dark';

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
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      onClick={toggleTheme}
      className={cn(
        "group relative inline-flex h-7 w-14 cursor-pointer select-none items-center rounded-full p-1 shrink-0 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-95",
        isDark
          ? "border border-indigo-800/60 bg-[#1e1b4b] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
          : "border border-emerald-300/80 bg-emerald-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]",
        className
      )}
    >
      {/* Background Track Icons */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-xs">
        {/* Left slot (visible in light mode behind dark thumb position) */}
        <Moon
          className={cn(
            "h-3.5 w-3.5 transition-opacity duration-300",
            isDark ? "opacity-0" : "text-emerald-800/45 opacity-100"
          )}
          strokeWidth={2.2}
        />
        {/* Right slot (visible in dark mode behind light thumb position) */}
        <Sun
          className={cn(
            "h-3.5 w-3.5 transition-opacity duration-300",
            isDark ? "text-indigo-300/50 opacity-100" : "opacity-0"
          )}
          strokeWidth={2.2}
        />
      </div>

      {/* Sliding Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        animate={{ x: isDark ? 0 : 28 }}
        className={cn(
          "relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white transition-shadow duration-300",
          isDark
            ? "shadow-[0_0_14px_rgba(168,85,247,0.55),0_2px_4px_rgba(0,0,0,0.4)]"
            : "shadow-[0_0_12px_rgba(52,211,153,0.65),0_2px_4px_rgba(0,0,0,0.15)]"
        )}
      >
        {isDark ? (
          <Moon className="h-3 w-3 text-indigo-950 transition-transform duration-200" strokeWidth={2.5} />
        ) : (
          <Sun className="h-3 w-3 text-amber-500 transition-transform duration-200" strokeWidth={2.5} />
        )}
      </motion.div>
    </button>
  );
}
