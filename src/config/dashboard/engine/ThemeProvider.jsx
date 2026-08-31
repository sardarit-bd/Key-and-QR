'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { THEME_IDS } from '@/config/dashboard/themes';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'myinspiretag-theme-mode';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredThemeMode() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredThemeMode(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // localStorage not available
  }
}

function applyThemeToDom(mode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.style.colorScheme = mode;
  root.setAttribute('data-theme-mode', mode);
  setStoredThemeMode(mode);
}

export function ThemeProvider({
  children,
  themeId = THEME_IDS.WEBSITE,
  userRole = null,
}) {
  const [themeMode, setThemeMode] = useState(() => {
    const stored = getStoredThemeMode();
    return stored || 'dark';
  });
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredThemeMode();
    const initialMode = stored || getSystemTheme();
    setThemeMode(initialMode);
    applyThemeToDom(initialMode);
    setIsReady(true);
  }, []);

  // Restore the public light theme when leaving a dashboard.
  // The public website is always light; only dashboards toggle dark/light.
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
        root.setAttribute('data-theme-mode', 'light');
      }
    };
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = getStoredThemeMode();
      if (!stored) {
        const newMode = e.matches ? 'dark' : 'light';
        setThemeMode(newMode);
        applyThemeToDom(newMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const changeThemeWithTransition = useCallback((nextMode, coords) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setThemeMode(nextMode);
      return;
    }

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsViewTransitions = typeof document.startViewTransition === 'function';

    if (!supportsViewTransitions || isReducedMotion) {
      setThemeMode(nextMode);
      applyThemeToDom(nextMode);
      return;
    }

    // Resolve click/origin coordinates
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (coords) {
      if (typeof coords.x === 'number' && typeof coords.y === 'number' && coords.x >= 0 && coords.y >= 0) {
        x = coords.x;
        y = coords.y;
      } else if (typeof coords.clientX === 'number' && typeof coords.clientY === 'number' && (coords.clientX > 0 || coords.clientY > 0)) {
        x = coords.clientX;
        y = coords.clientY;
      } else if (coords.currentTarget && typeof coords.currentTarget.getBoundingClientRect === 'function') {
        const rect = coords.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (coords.target && typeof coords.target.getBoundingClientRect === 'function') {
        const rect = coords.target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const root = document.documentElement;

    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setThemeMode(nextMode);
          applyThemeToDom(nextMode);
        });
      });

      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 480,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {
          // Safe fallback if transition is aborted or fails
        });
    } catch {
      setThemeMode(nextMode);
      applyThemeToDom(nextMode);
    }
  }, []);

  const toggleTheme = useCallback((coordsOrEvent) => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    changeThemeWithTransition(nextMode, coordsOrEvent);
  }, [themeMode, changeThemeWithTransition]);

  const setTheme = useCallback((mode, coordsOrEvent) => {
    if ((mode === 'dark' || mode === 'light') && mode !== themeMode) {
      changeThemeWithTransition(mode, coordsOrEvent);
    }
  }, [themeMode, changeThemeWithTransition]);

  const isDark = useMemo(() => themeMode === 'dark', [themeMode]);

  const contextValue = useMemo(() => ({
    themeId,
    themeMode,
    isDark,
    isReady,
    isMounted,
    toggleTheme,
    setTheme,
    userRole,
  }), [themeId, themeMode, isDark, isReady, isMounted, toggleTheme, setTheme, userRole]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
