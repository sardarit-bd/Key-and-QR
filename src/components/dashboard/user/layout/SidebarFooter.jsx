'use client';

import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SidebarFooter({ isCollapsed }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  const isAdmin =
    user?.role === 'admin' ||
    pathname?.startsWith('/new-dashboard/admin') ||
    pathname?.startsWith('/admin');

  const profileHref = isAdmin
    ? '/new-dashboard/admin/profile'
    : '/new-dashboard/user/profile';

  const handleLogout = async () => {
    await logout();
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pb-6 mt-auto">
        <Link
          href={profileHref}
          className="p-3 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 shadow-sm rounded-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 hover:scale-105"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </Link>
        <button
          onClick={handleLogout}
          className="p-3 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 shadow-sm rounded-xl hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-900/30 transition-all duration-300 hover:scale-105 cursor-pointer"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-6 mt-auto pt-6 border-t border-gray-200/60 dark:border-gray-800/60">
      <button
        onClick={handleLogout}
        className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 text-[15px] font-semibold text-gray-600 dark:text-gray-300 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 group overflow-hidden cursor-pointer"
      >
        {/* Subtle hover background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <LogOut
          size={18}
          className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
        />
        <span className="relative z-10">Logout</span>
      </button>
    </div>
  );
}