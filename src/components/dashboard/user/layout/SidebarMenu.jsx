'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import SidebarMenuItem from './SidebarMenuItem';
import SidebarNavGroup from './SidebarNavGroup';

/**
 * Sidebar Menu
 * Renders flat items as SidebarMenuItem and items with children as SidebarNavGroup.
 */
export default function SidebarMenu({ menuItems, isCollapsed }) {
  const pathname = usePathname();

  // Memoize menu items to prevent unnecessary re-renders
  const memoizedMenuItems = useMemo(() => menuItems, [menuItems]);

  if (!memoizedMenuItems || memoizedMenuItems.length === 0) {
    return null;
  }

  return (
    <nav className="px-4 flex flex-col gap-1" aria-label="Dashboard navigation">
      {memoizedMenuItems.map((item) => {
        // Items with children → render collapsible group
        if (item.children && item.children.length > 0) {
          return (
            <SidebarNavGroup
              key={item.id}
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
            />
          );
        }

        // Flat items → render standard menu item
        return (
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
        );
      })}
    </nav>
  );
}
