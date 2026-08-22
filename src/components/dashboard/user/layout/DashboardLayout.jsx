'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileTopNavbar from './MobileTopNavbar';
import BottomTabBar from './BottomTabBar';
import { useAuthStore } from '@/store/authStore';

/**
 * DashboardLayout Component
 * - Permanent left sidebar on desktop
 * - Sticky mobile top navbar with glassmorphism, brand logo & right hamburger trigger
 * - Smooth right-sliding mobile drawer
 * - Mobile bottom tab bar
 */
export default function DashboardLayout({ children, showBottomTabBar = true }) {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans selection:bg-primary/30">
      {/* 1. Mobile Top Navbar (sticky at top, md/lg hidden) */}
      <MobileTopNavbar onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* 2. Sidebar (Desktop Left + Mobile Right Drawer) */}
      <Sidebar
        user={user}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 3. Main Page Content */}
      <main className="flex-1 w-full lg:ml-72 transition-all duration-300">
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* 4. Mobile Bottom Tab Bar */}
      {showBottomTabBar && <BottomTabBar />}
    </div>
  );
}
