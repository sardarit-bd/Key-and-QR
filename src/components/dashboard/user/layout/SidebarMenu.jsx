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
  { id: 'scan-history', label: 'Scan History', icon: QrCode, href: '/new-dashboard/user/scan-history' },
  { id: 'favorites', label: 'Favorites', icon: Heart, href: '/new-dashboard/user/favorites' },
  { id: 'gifted', label: 'Gifted Messages', icon: Gift, href: '/new-dashboard/user/gifted' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, href: '/new-dashboard/user/premium' },
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