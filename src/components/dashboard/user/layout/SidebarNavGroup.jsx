'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

/**
 * Sidebar Nav Group — collapsible parent item with children.
 * Auto-expands when any child route matches the current path.
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
 const isAnyChildActive = item.children?.some(
 (child) => pathname?.startsWith(child.href)
 );

 // Auto-expand when a child route is active
 useEffect(() => {
 if (isAnyChildActive) {
 setExpanded(true);
 }
 }, [isAnyChildActive]);

 // Measure content height for smooth animation
 useEffect(() => {
 if (contentRef.current) {
 setContentHeight(contentRef.current.scrollHeight);
 }
 }, [item.children, expanded]);

 const isActive = isAnyChildActive;

 // Collapsed state: just render the icon with tooltip
 if (isCollapsed) {
 return (
 <div className="relative group">
 <button
 onClick={() => setExpanded(!expanded)}
 className={`
 w-full flex items-center justify-center px-0 py-3.5 rounded-xl text-[15px] 
 transition-all duration-200
 ${isActive
 ? 'bg-sidebar-accent text-sidebar-primary'
 : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
 }
 `}
 aria-expanded={expanded}
 aria-label={item.title}
 >
 <Icon size={20} strokeWidth={1.5} className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'} />
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
 {/* Parent button */}
 <button
 onClick={() => setExpanded(!expanded)}
 className={`
 group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] 
 transition-all duration-200 w-full text-left cursor-pointer
 ${isActive
 ? 'bg-sidebar-accent text-sidebar-primary'
 : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50'
 }
 `}
 aria-expanded={expanded}
 >
 <Icon
 size={20}
 strokeWidth={1.5}
 className={`flex-shrink-0 transition-colors ${
 isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground group-hover:text-sidebar-primary'
 }`}
 />

 <span className="flex-1 truncate tracking-wide">{item.title}</span>

 <ChevronDown
 size={14}
 strokeWidth={2}
 className={`flex-shrink-0 text-sidebar-foreground transition-transform duration-200 ${
 expanded ? 'rotate-180' : ''
 }`}
 />
 </button>

 {/* Children — animated expand/collapse */}
 <div
 className="overflow-hidden transition-all duration-200 ease-in-out"
 style={{ maxHeight: expanded ? `${contentHeight}px` : '0' }}
 >
 <div ref={contentRef} className="flex flex-col gap-0.5 pl-10 pr-4 pb-1">
 {item.children?.map((child) => {
 const isChildActive = pathname?.startsWith(child.href);
 return (
 <Link
 key={child.id}
 href={child.href}
 className={`
 flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-sm
 transition-all duration-200
 ${isChildActive
 ? 'bg-sidebar-accent/70 text-sidebar-primary font-medium'
 : 'text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/30'
 }
 `}
 aria-current={isChildActive ? 'page' : undefined}
 >
 <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
 isChildActive ? 'bg-sidebar-primary' : 'bg-sidebar-foreground/30'
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
