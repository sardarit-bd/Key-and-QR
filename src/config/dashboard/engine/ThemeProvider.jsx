'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { THEME_IDS } from '@/config/dashboard/themes';

const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = 'theme';
export const LEGACY_THEME_STORAGE_KEY = 'myinspiretag-theme-mode';

function cleanThemeValue(val) {
  if (!val || typeof val !== 'string') return null;
  const cleaned = val.replace(/['"]+/g, '').trim().toLowerCase();
  return (cleaned === 'light' || cleaned === 'dark') ? cleaned : null;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredThemeMode() {
  if (typeof window === 'undefined') return null;
  try {
    const rawTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    const primary = cleanThemeValue(rawTheme);
    const legacy = cleanThemeValue(rawLegacy);
    const cookieVal = cleanThemeValue(getCookie('theme'));
    const resolved = primary || legacy || cookieVal || null;
    console.log('[ThemeProvider:getStoredThemeMode] rawTheme=' + rawTheme + ' | rawLegacy=' + rawLegacy + ' | cookie=' + cookieVal + ' => resolved=' + resolved);
    return resolved;
  } catch (e) {
    console.warn('[ThemeProvider:getStoredThemeMode] Error reading storage:', e);
    return null;
  }
}

export function setStoredThemeMode(mode) {
  const validMode = (mode === 'light' || mode === 'dark') ? mode : 'dark';
  console.log('[ThemeProvider:setStoredThemeMode] Persisting theme=' + validMode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, validMode);
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, validMode);
  } catch (e) {
    console.warn('[ThemeProvider:setStoredThemeMode] LocalStorage failed:', e);
  }
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `theme=${validMode}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('[ThemeProvider:setStoredThemeMode] Cookie failed:', e);
  }
}

function applyThemeToDom(mode) {
  if (typeof document === 'undefined') return;
  const path = typeof window !== 'undefined' ? (window.location.pathname || '') : '';
  const isDashboard = path.indexOf('/dashboard') !== -1 || path.indexOf('/admin') !== -1;
  const root = document.documentElement;

  console.log('[ThemeProvider:applyThemeToDom] mode=' + mode + ' | isDashboard=' + isDashboard + ' | path=' + path);

  if (isDashboard) {
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.colorScheme = mode;
    root.setAttribute('data-theme-mode', mode);
    setStoredThemeMode(mode);
  } else {
    // Strictly preserve light mode on public/auth pages without wiping dashboard preference
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
    root.setAttribute('data-theme-mode', 'light');
  }
}

export function ThemeProvider({
  children,
  themeId = THEME_IDS.WEBSITE,
  userRole = null,
}) {
  const [themeMode, setThemeMode] = useState(() => {
    // 1. Check saved preferences first (localStorage / cookie)
    const stored = getStoredThemeMode();
    if (stored) {
      console.log('[ThemeProvider:useState] Initializing state from stored: ' + stored);
      return stored;
    }

    // 2. Check DOM initialized by themeScript in <head>
    if (typeof document !== 'undefined') {
      const dataMode = cleanThemeValue(document.documentElement.getAttribute('data-theme-mode'));
      if (dataMode) {
        console.log('[ThemeProvider:useState] Initializing state from DOM data-theme-mode: ' + dataMode);
        return dataMode;
      }

      if (document.documentElement.classList.contains('light')) {
        console.log('[ThemeProvider:useState] Initializing state from DOM class: light');
        return 'light';
      }
      if (document.documentElement.classList.contains('dark')) {
        console.log('[ThemeProvider:useState] Initializing state from DOM class: dark');
        return 'dark';
      }
    }

    console.log('[ThemeProvider:useState] Fallback: dark');
    return 'dark';
  });
  const [isReady, setIsReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredThemeMode();
    const currentDomMode = typeof document !== 'undefined'
      ? cleanThemeValue(document.documentElement.getAttribute('data-theme-mode')) ||
        (document.documentElement.classList.contains('light') ? 'light' :
         document.documentElement.classList.contains('dark') ? 'dark' : null)
      : null;

    console.log('[ThemeProvider:mount] stored=' + stored + ' | currentDomMode=' + currentDomMode);
    // Prioritize explicit saved user preference; never force dark if light is saved
    const initialMode = stored || currentDomMode || 'dark';
    console.log('[ThemeProvider:mount] setting themeMode=' + initialMode);
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
    console.log('[ThemeProvider:toggleTheme] themeMode=' + themeMode + ' -> switching to ' + nextMode);
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
      {/*
        HYDRATION FIX: server cannot read localStorage. Until mounted, render NO mode-specific
        attributes (identical on server and client) and inherit from <html>, which themeScript in
        layout.js already set before first paint. After mount, state-driven updates take over.
      */}
      <div
        className={`dashboard-theme-scope ${isMounted ? (themeMode === 'dark' ? 'dark' : 'light') : ''} min-h-screen`}
        data-theme-mode={isMounted ? themeMode : undefined}
        style={isMounted ? { colorScheme: themeMode } : undefined}
      >
        {children}
      </div>
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
