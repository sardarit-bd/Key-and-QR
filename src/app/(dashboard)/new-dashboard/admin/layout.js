'use client';

import { ThemeProvider } from '@/components/dashboard/engine/ThemeProvider';
import { THEME_IDS } from '@/config/dashboard/themes';

export default function AdminDashboardLayout({ children }) {
  return (
    <ThemeProvider themeId={THEME_IDS.ADMIN_DASHBOARD}>
      {children}
    </ThemeProvider>
  );
}