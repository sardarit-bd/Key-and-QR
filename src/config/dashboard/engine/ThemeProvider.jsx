'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
    if (stored) {
      setThemeMode(stored);
    } else {
      setThemeMode(getSystemTheme());
    }
    setIsReady(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!isReady) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the current theme mode class
    root.classList.add(themeMode);
    
    // Set color scheme for native elements
    root.style.colorScheme = themeMode;
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-theme-mode', themeMode);
    
    // Store the preference
    setStoredThemeMode(themeMode);
  }, [themeMode, isReady]);

  // Restore the public light theme when leaving a dashboard.
  // The public website is always light; only dashboards toggle dark/light.
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme-mode', 'light');
    };
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = getStoredThemeMode();
      if (!stored) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setTheme = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light') {
      setThemeMode(mode);
    }
  }, []);

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
