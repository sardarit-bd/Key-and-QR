'use client';

import Link from 'next/link';

export default function SidebarItem({ 
 label, 
 icon: Icon, 
 href, 
 isActive, 
 isCollapsed,
 onClick 
}) {
 return (
 <Link
 href={href}
 onClick={onClick}
 className={`
 group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] 
 transition-all duration-200
 ${isActive 
 ? 'bg-sidebar-accent text-sidebar-primary' 
 : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
 }
 ${isCollapsed ? 'justify-center px-0' : ''}
 `}
 aria-current={isActive ? 'page' : undefined}
 aria-label={isCollapsed ? label : undefined}
 >
 <Icon 
 size={20} 
 strokeWidth={1.5}
 className={`flex-shrink-0 transition-colors ${
 isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
 }`}
 />
 
 {!isCollapsed && (
 <span className="flex-1 truncate tracking-wide">{label}</span>
 )}
 </Link>
 );
}
