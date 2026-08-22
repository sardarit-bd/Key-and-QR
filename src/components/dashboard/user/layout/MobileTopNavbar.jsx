'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useTheme } from '@/config/dashboard/engine/ThemeProvider';

/**
 * MobileTopNavbar — Premium sticky header for mobile/tablet screens (< lg)
 * - Glassmorphism surface
 * - Brand logo on the left
 * - Hamburger trigger for right-sliding sidebar on the right
 * - NO shopping cart icon
 */
export default function MobileTopNavbar({ onMenuClick }) {
  const { themeMode } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex lg:hidden items-center justify-between px-4 sm:px-6 h-16 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-border/50 shadow-xs transition-colors">
      {/* Left: Brand Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <Image
          src={themeMode === 'light' ? '/logo/logo.png' : '/logo/white-logo-1.png'}
          alt="MyInspireTag Logo"
          width={130}
          height={34}
          priority
          className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-102"
        />
      </Link>

      {/* Right: Hamburger Menu Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="p-2.5 rounded-xl text-foreground hover:bg-muted/70 active:scale-95 transition-all duration-200 cursor-pointer border border-border/60 bg-card/60 shadow-2xs"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>
      </div>
    </header>
  );
}
