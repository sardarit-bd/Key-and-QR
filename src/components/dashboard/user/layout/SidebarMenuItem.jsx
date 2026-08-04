'use client';

import Link from 'next/link';

export default function SidebarMenuItem({
  id,
  title,
  icon: Icon,
  href,
  isActive,
  isCollapsed,
  badge,
  onClick,
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium
        transition-all duration-200
        ${isActive
          ? 'bg-sidebar-accent text-sidebar-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_4px_16px_-6px_rgb(0_0_0/0.4)]'
          : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/40'
        }
        ${isCollapsed ? 'justify-center px-0' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
      aria-label={isCollapsed ? title : undefined}
    >
      {/* Active indicator */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent" />
      )}

      <Icon
        size={20}
        strokeWidth={isActive ? 2 : 1.75}
        className={`flex-shrink-0 transition-all duration-200 ${
          isActive
            ? 'text-sidebar-primary'
            : 'text-sidebar-foreground group-hover:text-sidebar-primary group-hover:scale-105'
        }`}
      />

      {!isCollapsed && (
        <span className="flex-1 truncate tracking-wide">{title}</span>
      )}

      {/* Badge for premium items */}
      {badge && !isCollapsed && (
        <span className="text-[8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-accent to-accent/80 text-accent-foreground font-semibold uppercase tracking-wider">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {title}
          {badge && (
            <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-accent text-accent-foreground">
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
