'use client';

import UserDashboard from '@/components/dashboard/user/UserDashboard';
import { ThemeProvider } from '@/config/dashboard/engine/ThemeProvider';
import { THEME_IDS } from '@/config/dashboard/themes';

export default function UserDashboardPage() {
  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <UserDashboard />
    </ThemeProvider>
  );
}