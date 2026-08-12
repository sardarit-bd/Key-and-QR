'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

/**
 * Sidebar Nav Group — collapsible parent item with children.
 *
 * Behavior (identical to the Orders module):
 * - Parent is a single button; clicking ANYWHERE on the row
 *   (icon, label, empty space, chevron) expands/collapses.
 * - Auto-expands when the current route belongs to this module (parent or child).
 * - Only the currently opened page receives the active styling:
 *   the parent highlights when on its own page; a child highlights when
 *   its route is open. The parent never shows the active background just
 *   because a child is open (it only stays expanded).
 */
export default function SidebarNavGroup({
  item,
  pathname,
  isCollapsed,
}) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  const Icon = item.icon;

  /**
   * Exact route matching for the ACTIVE highlight.
   *
   * A child is active ONLY when `pathname === child.href`. No substring or
   * prefix matching is used, so `/users` never matches `/users/active` and
   * two submenu items can never be highlighted simultaneously.
   */
  const isChildActive = (child) => {
    if (!pathname) return false;
    return pathname === child.href;
  };

  /**
   * Boundary-aware matching for AUTO-EXPAND only.
   *
   * The parent expands when the current route lives under this module:
   *  - the module's own page (`pathname === href`)
   *  - OR a deeper route under it (`pathname.startsWith(href + "/")`)
   *
   * This never affects the active highlight — it only decides whether the
   * submenu stays open (e.g. a quote detail page keeps "Quotes" open even
   * though no sidebar child is highlighted).
   */
  const isRouteWithinModule = (href) => {
    if (!href || !pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAnyChildActive = item.children?.some(
    (child) => isChildActive(child)
  );

  // Parent is active ONLY when its own page is the current route.
  // The module's child pages never mark the parent active — they only
  // keep it expanded.
  const isParentActive =
    !!item.href && pathname === item.href;

  // Any child OR the module route itself is currently open → keep expanded.
  const isModuleOpen =
    isParentActive ||
    isAnyChildActive ||
    item.children?.some((child) => isRouteWithinModule(child.href));

  // Auto-expand when the current route belongs to this module
  // (parent page, any child page, or a deeper route under a child).
  useEffect(() => {
    if (isModuleOpen) {
      setExpanded(true);
    }
  }, [isModuleOpen]);

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.children, expanded]);

  // Collapsed state: just render the icon with tooltip
  if (isCollapsed) {
    return (
      <div className="relative group">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`
            w-full flex items-center justify-center px-0 py-3.5 rounded-xl text-[15px]
            transition-all duration-200
            ${isParentActive
              ? 'bg-sidebar-accent text-sidebar-primary'
              : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
            }
          `}
          aria-expanded={expanded}
          aria-label={item.title}
        >
          <Icon
            size={20}
            strokeWidth={1.5}
            className={isParentActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'}
          />
        </button>

        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {item.title}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Parent row — ONE button handles the ENTIRE row as the
          expand/collapse trigger. It never navigates; children navigate. */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`submenu-${item.id}`}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.title}`}
        className={`
          group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px]
          transition-all duration-200 w-full text-left cursor-pointer
          ${isParentActive
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
          }
        `}
      >
        <Icon
          size={20}
          strokeWidth={1.5}
          className={`flex-shrink-0 transition-colors ${
            isParentActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
          }`}
        />
        <span className="flex-1 truncate tracking-wide">{item.title}</span>

        {/* Chevron — visual indicator only, rotates with state */}
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden
          className={`flex-shrink-0 text-sidebar-foreground transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Children — animated expand/collapse */}
      <div
        id={`submenu-${item.id}`}
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: expanded ? `${contentHeight}px` : '0' }}
      >
        <div ref={contentRef} className="flex flex-col gap-0.5 pl-10 pr-4 pb-1">
          {item.children?.map((child) => {
            const isChildActiveFlag = isChildActive(child);
            return (
              <Link
                key={child.id}
                href={child.href}
                className={`
                  flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-sm
                  transition-all duration-200
                  ${isChildActiveFlag
                    ? 'bg-sidebar-accent/70 text-sidebar-primary font-medium'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/30'
                  }
                `}
                aria-current={isChildActiveFlag ? 'page' : undefined}
              >
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  isChildActiveFlag ? 'bg-sidebar-primary' : 'bg-sidebar-foreground/30'
                }`} />
                <span className="truncate">{child.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
