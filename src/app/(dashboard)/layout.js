"use client";

import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import Sidebar from "@/components/dashboard/user/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="min-h-screen flex">
        <Sidebar />

        <main className="flex-1 lg:ml-[288px]">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}