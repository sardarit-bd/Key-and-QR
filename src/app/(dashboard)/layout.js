"use client";

import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import Sidebar from "@/components/dashboard/user/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="min-h-screen flex">
        <Sidebar />

        {/* Added min-w-0 to prevent flex container blowout on mobile */}
        <main className="flex-1 lg:ml-[288px] min-w-0">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}