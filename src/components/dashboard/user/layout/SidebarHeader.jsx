'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SidebarHeader({ isCollapsed }) {
  return (
    <Link
      href="/new-dashboard/user"
      aria-label="Dashboard home"
      className={`flex w-full justify-center ${
        isCollapsed ? 'px-3' : 'px-5'
      }`}
    >
      <Image
        src="/logo/white-logo-1.png"
        alt="MyInspireTag Logo"
        width={180}
        height={48}
        priority
        className="h-[100px] w-[180px] object-contain"
      />
    </Link>
  );
}