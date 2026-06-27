'use client';

import Link from 'next/link';

export default function SidebarHeader({ isCollapsed }) {
  return (
    <Link
      href="/dashboard/user"
      className={`flex items-center gap-3 px-6 py-6 ${isCollapsed ? 'justify-center' : ''}`}
      aria-label="Dashboard home"
    >
      {/* Shell Icon SVG as seen in the image */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#e3ba85] flex-shrink-0"
      >
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.5 15.5L12 12L18.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.5 9L12 12L20.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      {!isCollapsed && (
        <span className="text-[22px] font-serif text-[#e3ba85] tracking-wide">
          MyInspireTag
        </span>
      )}
    </Link>
  );
}