'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import SidebarFooter from './SidebarFooter';
import SidebarUpgradeCard from './SidebarUpgradeCard';
import SidebarMenu from './SidebarMenu';
import SidebarHeader from './SidebarHeader';
import SidebarProfile from './SidebarProfile';

const SIDEBAR_WIDTH = 'w-72';
const COLLAPSED_WIDTH = 'w-20';

export default function Sidebar({ user, isCollapsed = false, onToggle }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(isCollapsed);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

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
    border-none
    transition-all duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0
    flex flex-col
  `;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#070911] text-[#e3ba85] shadow-lg border border-[#e3ba85]/20"
        aria-label={isMobileOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={sidebarClasses} aria-label="Dashboard navigation">
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pb-6">
          <SidebarHeader isCollapsed={isDesktopCollapsed} />
          
          <div className="mt-4">
            <SidebarProfile
              user={user} 
              isCollapsed={isDesktopCollapsed} 
            />
          </div>

          <SidebarMenu 
            pathname={pathname} 
            isCollapsed={isDesktopCollapsed} 
          />

          <div className="mt-4">
            <SidebarUpgradeCard isCollapsed={isDesktopCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}