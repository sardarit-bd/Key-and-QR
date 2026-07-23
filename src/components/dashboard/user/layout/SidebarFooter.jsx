'use client';

import { LogOut, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function SidebarFooter({ isCollapsed }) {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
        <Link
          href="/new-dashboard/user/profile"
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">      
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}
