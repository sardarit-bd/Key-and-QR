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
          className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
        <Link
          href="/new-dashboard/user/profile"
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
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
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:text-destructive/80 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}
