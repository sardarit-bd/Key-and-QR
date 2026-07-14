'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, THEME_IDS } from '@/config/dashboard/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ 
  children, 
  themeId = THEME_IDS.WEBSITE,
  userRole = null,
}) {
  const [theme, setTheme] = useState(() => getTheme(themeId));
  const [isReady, setIsReady] = useState(false);

  // Apply theme to DOM
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      // Apply CSS variables
      const colors = theme.colors || {};
      Object.entries(colors).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--${key}`, value);
        }
      });
      
      // Apply dark mode
      if (theme.isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
      
      // Apply theme class
      root.setAttribute('data-theme', theme.id);
      
      setIsReady(true);
    };

    applyTheme();
  }, [theme]);

  // Update theme when themeId changes
  useEffect(() => {
    const newTheme = getTheme(themeId);
    if (newTheme && newTheme.id !== theme.id) {
      setTheme(newTheme);
    }
  }, [themeId]);

  const changeTheme = (newThemeId) => {
    const newTheme = getTheme(newThemeId);
    if (newTheme) {
      setTheme(newTheme);
    }
  };

  const contextValue = {
    theme,
    themeId: theme.id,
    changeTheme,
    isReady,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    components: theme.components,
    isDark: theme.isDark,
  };

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