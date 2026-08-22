'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SidebarFooter from './SidebarFooter';
import SidebarUpgradeCard from './SidebarUpgradeCard';
import SidebarMenu from './SidebarMenu';
import SidebarHeader from './SidebarHeader';
import SidebarProfile from './SidebarProfile';
import useSidebar from '@/hooks/sidebar/useSidebar';

const SIDEBAR_WIDTH = 'w-72';
const COLLAPSED_WIDTH = 'w-20';

export default function Sidebar({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const sidebarData = useSidebar();

  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(isCollapsed);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onMobileClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onMobileClose]);

  // Handle resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        onMobileClose?.();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMobileClose]);

  // Don't render if not authenticated
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <>
      {/* ============================================================
          1. MOBILE RIGHT-SLIDING DRAWER (< lg)
         ============================================================ */}
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Slides from RIGHT) */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-72 sm:w-80 max-w-[85vw] bg-sidebar border-l border-sidebar-border shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!isMobileOpen}
      >
        {/* Mobile Drawer Header with Close (X) Button */}
        <div className="flex-shrink-0 p-4 border-b border-sidebar-border/60 flex items-center justify-between">
          <SidebarHeader isCollapsed={false} />
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="p-2 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted/60 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex-shrink-0 px-4 pt-4">
          <SidebarProfile
            profile={sidebarData.profile}
            isCollapsed={false}
          />
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-h-0 px-3 py-4">
          <SidebarMenu
            menuItems={sidebarData.menuItems}
            pathname={pathname}
            isCollapsed={false}
          />

          <div className="mt-5">
            <SidebarUpgradeCard
              isCollapsed={false}
              config={sidebarData.upgradeCard}
              userPlan={sidebarData.userPlan}
              shouldShow={sidebarData.shouldShowUpgrade}
            />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex-shrink-0 px-4 pb-6 pt-3 border-t border-sidebar-border/40">
          <SidebarFooter isCollapsed={false} />
        </div>
      </aside>

      {/* ============================================================
          2. DESKTOP PERMANENT LEFT SIDEBAR (>= lg)
         ============================================================ */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen ${
          isDesktopCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out flex-col`}
        aria-label="Desktop navigation"
      >
        {/* SECTION 1: Fixed Header + Profile */}
        <div className="flex-shrink-0">
          <SidebarHeader isCollapsed={isDesktopCollapsed} />
          <div className="mt-4">
            <SidebarProfile
              profile={sidebarData.profile}
              isCollapsed={isDesktopCollapsed}
            />
          </div>
        </div>

        {/* SECTION 2: Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-h-0">
          <SidebarMenu
            menuItems={sidebarData.menuItems}
            pathname={pathname}
            isCollapsed={isDesktopCollapsed}
          />

          <div className="mt-5">
            <SidebarUpgradeCard
              isCollapsed={isDesktopCollapsed}
              config={sidebarData.upgradeCard}
              userPlan={sidebarData.userPlan}
              shouldShow={sidebarData.shouldShowUpgrade}
            />
          </div>
        </div>

        {/* SECTION 3: Fixed Footer */}
        <div className="flex-shrink-0 px-4 pb-6 pt-4">
          <SidebarFooter isCollapsed={isDesktopCollapsed} />
        </div>
      </aside>
    </>
  );
}
