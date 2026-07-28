'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sparkles, BookOpen, User, LayoutDashboard, Users, ShoppingBag, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const USER_TABS = [
  { id: 'home', label: 'Home', icon: Home, href: '/new-dashboard/user', exact: true },
  { id: 'inspire', label: 'Inspire', icon: Sparkles, href: '/new-dashboard/user/my-quotes', exact: false },
  { id: 'library', label: 'Library', icon: BookOpen, href: '/new-dashboard/user/favorites', exact: false },
  { id: 'profile', label: 'Profile', icon: User, href: '/new-dashboard/user/profile', exact: false },
];

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/new-dashboard/admin', exact: true },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, href: '/new-dashboard/admin/orders', exact: false },
  { id: 'users', label: 'Users', icon: Users, href: '/new-dashboard/admin/users', exact: false },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/new-dashboard/admin/settings', exact: false },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = pathname?.startsWith('/new-dashboard/admin');

  const TABS = isAdmin && isAdminRoute ? ADMIN_TABS : USER_TABS;

  const isActive = (tab) => {
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar border-t border-sidebar-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-sidebar-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${active ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
