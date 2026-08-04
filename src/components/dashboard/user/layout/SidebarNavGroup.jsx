'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

/**
 * Sidebar Nav Group — collapsible parent item with children.
 *
 * Behavior (identical to the Orders module):
 * - Parent is a button with a chevron; clicking it expands/collapses.
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

  // Determine if any child is active
  const isChildActive = (child) =>
    child.exact
      ? pathname === child.href
      : pathname?.startsWith(child.href);

  const isAnyChildActive = item.children?.some(
    (child) => isChildActive(child)
  );

  // Parent is active ONLY when its own page is the current route.
  // The module's child pages never mark the parent active — they only
  // keep it expanded.
  const isParentActive =
    !!item.href && pathname === item.href;

  // Auto-expand when the current route belongs to this module
  // (parent page OR any child page).
  useEffect(() => {
    if (isParentActive || isAnyChildActive) {
      setExpanded(true);
    }
  }, [isParentActive, isAnyChildActive]);

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
      {/* Parent row — composite: Link for navigation (when href exists) +
          chevron button for expand/collapse */}
      <div
        className={`
          group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px]
          transition-all duration-200 w-full text-left cursor-pointer
          ${isParentActive
            ? 'bg-sidebar-accent text-sidebar-primary'
            : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
          }
        `}
      >
        {/* Navigation target — icon + label navigate to the parent page */}
        {item.href ? (
          <Link
            href={item.href}
            className="flex items-center gap-4 flex-1 min-w-0"
            aria-current={isParentActive ? 'page' : undefined}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              className={`flex-shrink-0 transition-colors ${
                isParentActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
              }`}
            />
            <span className="flex-1 truncate tracking-wide">{item.title}</span>
          </Link>
        ) : (
          <>
            <Icon
              size={20}
              strokeWidth={1.5}
              className={`flex-shrink-0 transition-colors ${
                isParentActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
              }`}
            />
            <span className="flex-1 truncate tracking-wide">{item.title}</span>
          </>
        )}

        {/* Chevron toggle — only expands/collapses, never navigates */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setExpanded(!expanded);
          }}
          className="flex-shrink-0 p-1 -mr-1 rounded-md hover:bg-sidebar-foreground/10 transition-colors"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${item.title}` : `Expand ${item.title}`}
        >
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`text-sidebar-foreground transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Children — animated expand/collapse */}
      <div
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
