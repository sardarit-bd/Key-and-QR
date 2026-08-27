'use client';

import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SidebarFooter({ isCollapsed, isMobile = false }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const isAdmin =
    user?.role === 'admin' ||
    pathname?.startsWith('/dashboard/admin') ||
    pathname?.startsWith('/admin');

  const profileHref = isAdmin
    ? '/dashboard/admin/profile'
    : '/dashboard/user/profile';

  const handleLogout = async () => {
    await logout();
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 px-3 pb-4 mt-auto">
        <Link
          href={profileHref}
          className="p-2.5 text-foreground-tertiary bg-card border border-border shadow-xs rounded-xl hover:text-accent hover:bg-accent/10 hover:border-accent/30 transition-all duration-300 hover:scale-105"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </Link>
        <button
          onClick={handleLogout}
          className="p-2.5 text-foreground-tertiary bg-card border border-border shadow-xs rounded-xl hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className={isMobile ? "w-full" : "px-4 pb-4 mt-auto pt-4 border-t border-border"}>
      <button
        onClick={handleLogout}
        type="button"
        className="relative w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 shadow-xs transition-all duration-300 active:scale-98 group overflow-hidden cursor-pointer"
      >
        {/* Subtle red hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <LogOut
          size={16}
          className="relative z-10 text-red-500/80 group-hover:text-red-500 transition-transform duration-300 group-hover:-translate-x-0.5"
        />
        <span className="relative z-10">Logout</span>
      </button>
    </div>
  );
}