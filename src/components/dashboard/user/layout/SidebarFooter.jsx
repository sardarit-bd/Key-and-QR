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
      <div className="flex flex-col items-center gap-2.5">
        <button
          onClick={handleLogout}
          className="p-2.5 text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
        <Link
          href="/new-dashboard/user/profile"
          className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all duration-200 hover:scale-105"
          aria-label="Settings"
        >
          <SettingsIcon size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 border-t border-sidebar-border pt-4">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-destructive rounded-xl hover:bg-destructive/10 transition-all duration-200 cursor-pointer group"
      >
        <LogOut size={17} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}
