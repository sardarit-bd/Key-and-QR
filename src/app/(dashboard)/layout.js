"use client";

import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import Sidebar from "@/components/dashboard/user/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="min-h-screen bg-slate-950 flex">
        <Sidebar />

        <main className="flex-1 lg:ml-[320px]">
          <div className="min-h-screen px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}