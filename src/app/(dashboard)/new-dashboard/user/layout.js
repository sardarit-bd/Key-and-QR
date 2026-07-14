'use client';

import Sidebar from "@/components/dashboard/user/layout/Sidebar";
import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import { useAuthStore } from "@/store/authStore";

export default function UserDashboardLayout({ children }) {
  const { user } = useAuthStore();

  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="min-h-screen flex bg-[#070911] text-white font-sans selection:bg-[#e3ba85]/30">
        
        {/* Sidebar Component */}
        <Sidebar user={user} />

        <main className="flex-1 w-full transition-all duration-300">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
        
      </div>
    </ThemeProvider>
  );
}