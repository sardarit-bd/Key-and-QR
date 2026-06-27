'use client';

import Sidebar from "@/components/dashboard/user/layout/Sidebar";
import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import { useAuthStore } from "@/store/authStore";


export default function UserDashboardLayout({ children }) {
  const { user } = useAuthStore();

  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="">
        <Sidebar user={user} />
        <main className="">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}