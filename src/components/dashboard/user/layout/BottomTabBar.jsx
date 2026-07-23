'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Sparkles, BookOpen, User } from 'lucide-react';

/**
 * Mobile Bottom Tab Bar
 * Spec Section 3.2: Home, Inspire, Library, Profile tabs
 */
const TABS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/new-dashboard/user',
    exact: true,
  },
  {
    id: 'inspire',
    label: 'Inspire',
    icon: Sparkles,
    href: '/new-dashboard/user/my-quotes',
    exact: false,
  },
  {
    id: 'library',
    label: 'Library',
    icon: BookOpen,
    href: '/new-dashboard/user/favorites',
    exact: false,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/new-dashboard/user/profile',
    exact: false,
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (tab) => {
    if (tab.exact) {
      return pathname === tab.href;
    }
    return pathname?.startsWith(tab.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070911] border-t border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-[#e3ba85]' : 'text-gray-500'
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
