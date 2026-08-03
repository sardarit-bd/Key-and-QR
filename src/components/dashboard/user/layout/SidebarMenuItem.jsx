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
 group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] 
 transition-all duration-200 relative
 ${isActive 
 ? 'bg-sidebar-accent text-sidebar-primary' 
 : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
 }
 ${isCollapsed ? 'justify-center px-0' : ''}
 `}
 aria-current={isActive ? 'page' : undefined}
 aria-label={isCollapsed ? title : undefined}
 >
 <Icon 
 size={20} 
 strokeWidth={1.5}
 className={`flex-shrink-0 transition-colors ${
 isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
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
