'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/user/layout/Sidebar';
import { ThemeProvider } from '@/config/dashboard/engine/ThemeProvider';
import { THEME_IDS } from '@/config/dashboard/themes';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

function AdminDashboardSkeleton({ collapsed = false }) {
  const marginClass = collapsed ? 'lg:ml-20' : 'lg:ml-72';
  return (
    <div className="min-h-screen flex bg-background">
      <div className={`hidden lg:block w-72 h-screen fixed top-0 left-0 bg-sidebar border-r border-sidebar-border transition-all duration-300`}>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-muted rounded w-32" />
          <div className="flex items-center gap-3 mt-6">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className={`flex-1 ${marginClass} p-6 transition-all duration-300`}>
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-card rounded-xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardLayout({ children }) {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && isInitialized && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/new-dashboard/user');
    }
  }, [hydrated, isInitialized, isAuthenticated, user, router]);

  const marginLeftClass = sidebarCollapsed
    ? 'lg:ml-20'
    : 'lg:ml-72';

  if (!hydrated) {
    return <AdminDashboardSkeleton collapsed={false} />;
  }

  if (!isInitialized || !isAuthenticated || user?.role !== 'admin') {
    return <AdminDashboardSkeleton collapsed={sidebarCollapsed} />;
  }

  return (
    <ThemeProvider themeId={THEME_IDS.ADMIN_DASHBOARD}>
      <div className="min-h-screen flex bg-background text-foreground font-sans selection:bg-primary/30">
        <Sidebar
          user={user}
          onToggle={(collapsed) => setSidebarCollapsed(collapsed)}
        />
        <main className={`flex-1 w-full ${marginLeftClass} transition-all duration-300`}>
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
