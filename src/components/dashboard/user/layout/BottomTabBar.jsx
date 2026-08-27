'use client';

import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, Sparkles, BookOpen, User, LayoutDashboard, Users, ShoppingBag, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const USER_TABS = [
  { id: 'home',        label: 'Home',       icon: Home,        href: '/new-dashboard/user',                 exact: true  },
  { id: 'inspire',    label: 'Inspire',    icon: Sparkles,    href: '/new-dashboard/user?action=inspire',  exact: true  },
  { id: 'collection', label: 'Collection', icon: BookOpen,    href: '/new-dashboard/user/favorites',       exact: false },
  { id: 'shop',       label: 'Shop',       icon: ShoppingBag, href: '/shop',                               exact: false },
  { id: 'profile',    label: 'Profile',    icon: User,        href: '/new-dashboard/user/profile',         exact: false },
];

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/new-dashboard/admin',        exact: true  },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag,     href: '/new-dashboard/admin/orders',  exact: false },
  { id: 'users',     label: 'Users',     icon: Users,           href: '/new-dashboard/admin/users',   exact: false },
  { id: 'settings',  label: 'Settings',  icon: Settings,        href: '/new-dashboard/admin/settings',exact: false },
];

/**
 * Inner component — isolates useSearchParams() inside a Suspense boundary so
 * Next.js can statically render pages that include the layout without bailing
 * out. The <Suspense> wrapper is added in the exported BottomTabBar shell below.
 */
function TabBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = pathname?.startsWith('/new-dashboard/admin');
  const TABS = isAdmin && isAdminRoute ? ADMIN_TABS : USER_TABS;

  const isActive = (tab) => {
    const onDashboardHome = pathname === '/new-dashboard/user';
    const hasInspireAction = searchParams?.get('action') === 'inspire';

    if (tab.id === 'home') {
      // Active on dashboard root WITHOUT ?action=inspire (no double-highlight).
      return onDashboardHome && !hasInspireAction;
    }
    if (tab.id === 'inspire') {
      // Active on dashboard root WITH ?action=inspire.
      return onDashboardHome && hasInspireAction;
    }
    if (tab.id === 'shop') {
      return pathname === '/shop' || pathname?.startsWith('/shop/') || pathname?.startsWith('/products/');
    }
    if (tab.id === 'collection') {
      return pathname === '/new-dashboard/user/favorites' || pathname?.startsWith('/new-dashboard/user/favorites/');
    }
    if (tab.id === 'profile') {
      return pathname === '/new-dashboard/user/profile' || pathname?.startsWith('/new-dashboard/user/profile/');
    }
    if (tab.exact) return pathname === tab.href;
    return pathname?.startsWith(tab.href);
  };

  return (
    <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-all duration-200 ${
              active
                ? 'text-primary font-semibold'
                : 'text-foreground-secondary/70 hover:text-foreground'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} className="shrink-0" />
            <span className={`text-[11px] mt-1 tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Exported shell — renders the fixed nav chrome immediately, then suspends
 * only the interactive tab content while useSearchParams() resolves.
 */
export default function BottomTabBar() {
  const pathname = usePathname();
  const isScanPage =
    pathname?.startsWith('/t/') ||
    pathname?.startsWith('/tag/') ||
    pathname?.startsWith('/TAG-') ||
    pathname?.startsWith('/QR-');

  if (isScanPage) return null;

  return (
    <nav
      data-slot="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 dark:bg-card/90 backdrop-blur-xl border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] safe-area-bottom"
    >
      <Suspense fallback={<div className="h-16" />}>
        <TabBarInner />
      </Suspense>
    </nav>
  );
}

