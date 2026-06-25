'use client';

import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";


export default function UserDashboardLayout({ children }) {
  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      {children}
    </ThemeProvider>
  );
}