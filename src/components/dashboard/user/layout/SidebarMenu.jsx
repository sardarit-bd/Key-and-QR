'use client';

import { useMemo } from 'react';
import SidebarMenuItem from './SidebarMenuItem';

/**
 * Sidebar Menu
 * Dynamic menu rendered from configuration
 */
export default function SidebarMenu({ menuItems, pathname, isCollapsed }) {
  // Memoize menu items to prevent unnecessary re-renders
  const memoizedMenuItems = useMemo(() => menuItems, [menuItems]);

  if (!memoizedMenuItems || memoizedMenuItems.length === 0) {
    return null;
  }

  return (
    <nav className="px-4 flex flex-col gap-1" aria-label="Dashboard navigation">
      {memoizedMenuItems.map((item) => (
        <SidebarMenuItem
          key={item.id}
          id={item.id}
          title={item.title}
          icon={item.icon}
          href={item.href}
          isActive={
            item.exact 
              ? pathname === item.href 
              : pathname?.startsWith(item.href)
          }
          isCollapsed={isCollapsed}
          badge={item.badge}
        />
      ))}
    </nav>
  );
}