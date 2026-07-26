'use client';

import { useTheme } from '@/config/dashboard/engine/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ className }) {
  const { themeMode, toggleTheme, isMounted } = useTheme();

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={className}
        disabled
        aria-label="Loading theme toggle"
      >
        <div className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={className}
      aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {themeMode === 'dark' ? (
        <Sun className="size-4 transition-transform duration-200" />
      ) : (
        <Moon className="size-4 transition-transform duration-200" />
      )}
    </Button>
  );
}
