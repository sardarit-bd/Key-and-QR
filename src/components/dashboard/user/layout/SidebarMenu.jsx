'use client';

import { 
  Home, 
  Quote, 
  Sparkles, 
  QrCode, 
  Heart, 
  Gift, 
  BookOpen, 
  CreditCard, 
  Settings
} from 'lucide-react';
import SidebarItem from './SidebarItem';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/new-dashboard/user', exact: true },
  { id: 'my-quotes', label: 'My Quotes', icon: Quote, href: '/new-dashboard/user/my-quotes' },
  { id: 'reflections', label: 'Reflections', icon: Sparkles, href: '/dashboard/user/reflections' },
  { id: 'scan-history', label: 'Scan History', icon: QrCode, href: '/dashboard/user/scan-history' },
  { id: 'favorites', label: 'Favorites', icon: Heart, href: '/dashboard/user/favorites' },
  { id: 'gifted', label: 'Gifted Messages', icon: Gift, href: '/dashboard/user/gifted' },
  { id: 'categories', label: 'Categories', icon: BookOpen, href: '/dashboard/user/categories' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, href: '/dashboard/user/subscription' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/user/settings' },
];

export default function SidebarMenu({ pathname, isCollapsed }) {
  return (
    <nav className="px-4 flex flex-col gap-1" aria-label="Dashboard navigation">
      {MENU_ITEMS.map((item) => (
        <SidebarItem
          key={item.id}
          {...item}
          isActive={item.exact ? pathname === item.href : pathname?.startsWith(item.href)}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
}