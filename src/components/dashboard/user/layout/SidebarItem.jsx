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
        group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-serif
        transition-all duration-200
        ${isActive 
          ? 'bg-[#181512] text-[#e3ba85]' 
          : 'text-gray-300 hover:text-[#e3ba85] hover:bg-[#181512]/50'
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
          isActive ? 'text-[#e3ba85]' : 'text-gray-400 group-hover:text-[#e3ba85]'
        }`}
      />
      
      {!isCollapsed && (
        <span className="flex-1 truncate tracking-wide">{label}</span>
      )}
    </Link>
  );
}