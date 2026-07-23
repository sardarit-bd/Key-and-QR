'use client';

import { useState, useEffect } from 'react';
import Sidebar from "@/components/dashboard/user/layout/Sidebar";
import BottomTabBar from "@/components/dashboard/user/layout/BottomTabBar";
import { ThemeProvider } from "@/config/dashboard/engine/ThemeProvider";
import { THEME_IDS } from "@/config/dashboard/themes";
import { useAuthStore } from "@/store/authStore";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex bg-[#070911]">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-72 h-screen fixed top-0 left-0 bg-[#1e2335] border-r border-white/5">
        <div className="p-6 space-y-4">
          <div className="h-8 bg-white/5 rounded w-32" />
          <div className="flex items-center gap-3 mt-6">
            <div className="w-12 h-12 rounded-full bg-white/5" />
            <div className="space-y-2">
              <div className="h-4 bg-white/5 rounded w-24" />
              <div className="h-3 bg-white/5 rounded w-32" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 lg:ml-72 p-6">
        <div className="space-y-4">
          <div className="h-8 bg-white/5 rounded w-48" />
          <div className="h-4 bg-white/5 rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardLayout({ children }) {
  const { user } = useAuthStore();

  // useState(false) ensures SSR renders false, useEffect sets true on client
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Show skeleton until client-side hydration is complete
  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <ThemeProvider themeId={THEME_IDS.USER_DASHBOARD}>
      <div className="min-h-screen flex bg-[#070911] text-white font-sans selection:bg-[#e3ba85]/30">
        
        {/* Sidebar Component */}
        <Sidebar user={user} />

        <main className="flex-1 w-full transition-all duration-300">
          <div className="min-h-screen pb-20 lg:pb-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <BottomTabBar />
        
      </div>
    </ThemeProvider>
  );
}
