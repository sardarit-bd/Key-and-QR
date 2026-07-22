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
        group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-serif
        transition-all duration-200 relative
        ${isActive 
          ? 'bg-[#181512] text-[#e3ba85]' 
          : 'text-gray-300 hover:text-[#e3ba85] hover:bg-[#181512]/50'
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
          isActive ? 'text-[#e3ba85]' : 'text-gray-400 group-hover:text-[#e3ba85]'
        }`}
      />
      
      {!isCollapsed && (
        <span className="flex-1 truncate tracking-wide">{title}</span>
      )}

      {/* Badge for premium items */}
      {badge && !isCollapsed && (
        <span className="text-[8px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold uppercase tracking-wider">
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {title}
          {badge && (
            <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-amber-500 text-white">
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}