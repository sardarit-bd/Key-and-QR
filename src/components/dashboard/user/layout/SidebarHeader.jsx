'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/dashboard/shared/ThemeToggle';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';

export default function SidebarHeader({ isCollapsed, isMobile = false }) {
  const { themeMode } = useTheme();

  return (
    <div className="flex items-center justify-between w-full">
      <Link
        href="/"
        aria-label="Dashboard home"
        className={`flex items-center ${
          isCollapsed ? 'px-2' : 'px-1'
        }`}
      >
        <Image
          src={themeMode === 'light' ? '/logo/logo.png' : '/logo/white-logo-1.png'}
          alt="MyInspireTag Logo"
          width={130}
          height={34}
          priority
          className="h-8 sm:h-8.5 w-auto object-contain"
        />
      </Link>
      
      {/* Theme Toggle */}
      <div className="flex items-center shrink-0">
        <ThemeToggle />
      </div>
    </div>
  );
}
