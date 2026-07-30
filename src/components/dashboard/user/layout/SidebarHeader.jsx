'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/dashboard/shared/ThemeToggle';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';

export default function SidebarHeader({ isCollapsed }) {
  const { themeMode } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <Link
        href="/"
        aria-label="Dashboard home"
        className={`flex justify-center ${
          isCollapsed ? 'px-3' : 'px-5'
        }`}
      >
        <Image
          src={themeMode === 'light' ? '/logo/logo.png' : '/logo/white-logo-1.png'}
          alt="MyInspireTag Logo"
          width={180}
          height={48}
          priority
          className="h-[100px] w-[180px] object-contain"
        />
      </Link>
      
      {/* Theme Toggle */}
      <div className="pr-2">
        <ThemeToggle className="text-sidebar-foreground hover:text-sidebar-primary" />
      </div>
    </div>
  );
}
