'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import SidebarFooter from './SidebarFooter';
import SidebarUpgradeCard from './SidebarUpgradeCard';
import SidebarMenu from './SidebarMenu';
import SidebarHeader from './SidebarHeader';
import SidebarProfile from './SidebarProfile';
import useSidebar from '@/hooks/sidebar/useSidebar';

const SIDEBAR_WIDTH = 'w-72';
const COLLAPSED_WIDTH = 'w-20';

export default function Sidebar({ isCollapsed = false, onToggle }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();
  const sidebarData = useSidebar();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(isCollapsed);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed);
      onToggle?.(!isDesktopCollapsed);
    }
  };

  const sidebarClasses = `
    fixed top-0 left-0 z-50 h-full 
    ${isDesktopCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH}
    bg-[#070911]
    bg-[#1e2335]
    border-none
    transition-all duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
    flex flex-col
  `;

  // Don't render if not authenticated
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#070911] text-[#e3ba85] shadow-lg border border-[#e3ba85]/20"
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={sidebarClasses} aria-label="Dashboard navigation">
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

          <div className="mt-4 px-4">
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
