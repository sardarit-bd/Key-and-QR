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
      {/* Mobile Backdrop Overlay (z-[60] covers bottom tab bar) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer (Slides from RIGHT, z-[70] covers all elements) */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-[100dvh] w-72 sm:w-80 max-w-[85vw] bg-sidebar border-l border-sidebar-border shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!isMobileOpen}
      >
        {/* Mobile Drawer Header with Close (X) Button - Compact h-14 */}
        <div className="flex-shrink-0 h-14 px-4 border-b border-sidebar-border flex items-center justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <SidebarHeader isCollapsed={false} isMobile={true} />
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted/60 transition cursor-pointer shrink-0"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable Navigation (Compact Profile Card + Navigation Menu + Upgrade Card) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar min-h-0 px-3 pt-3 pb-8">
          {/* Compact Profile Card */}
          <SidebarProfile
            profile={sidebarData.profile}
            isCollapsed={false}
            isCompact={true}
          />

          <SidebarMenu
            menuItems={sidebarData.menuItems}
            pathname={pathname}
            isCollapsed={false}
          />

          <div className="mt-4">
            <SidebarUpgradeCard
              isCollapsed={false}
              config={sidebarData.upgradeCard}
              userPlan={sidebarData.userPlan}
              shouldShow={sidebarData.shouldShowUpgrade}
            />
          </div>
        </div>

        {/* Mobile Footer - Pinned to bottom with safe-area spacing */}
        <div className="flex-shrink-0 p-3.5 pb-6 border-t border-sidebar-border bg-sidebar/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.15)]">
          <SidebarFooter isCollapsed={false} isMobile={true} />
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
        <div className="flex-shrink-0 px-4 pt-4">
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
