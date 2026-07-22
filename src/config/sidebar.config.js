import {
    Home,
    Quote,
    Sparkles,
    QrCode,
    Heart,
    Gift,
    BookOpen,
    CreditCard,
    Settings,
    Users,
    LayoutDashboard,
    Tag,
    ShoppingBag,
  } from 'lucide-react';
  
  /**
   * Subscription Plans
   */
  export const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    PREMIUM: 'premium',
    TRIAL: 'trial',
    EXPIRED: 'expired',
    ADMIN: 'admin',
  };
  
  /**
   * Menu Visibility Rules
   */
  export const MENU_VISIBILITY = {
    ALL: 'all',
    FREE: 'free',
    PREMIUM: 'premium',
    ADMIN: 'admin',
    AUTHENTICATED: 'authenticated',
  };
  
  /**
   * Sidebar Configuration
   * Centralized menu configuration
   */
  export const SIDEBAR_CONFIG = {
    // Menu items configuration
    menuItems: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        icon: Home,
        href: '/new-dashboard/user',
        visibility: MENU_VISIBILITY.ALL,
        exact: true,
      },
      {
        id: 'my-quotes',
        title: 'My Quotes',
        icon: Quote,
        href: '/new-dashboard/user/my-quotes',
        visibility: MENU_VISIBILITY.ALL,
      },
      {
        id: 'scan-history',
        title: 'Scan History',
        icon: QrCode,
        href: '/new-dashboard/user/scan-history',
        visibility: MENU_VISIBILITY.ALL,
      },
      {
        id: 'favorites',
        title: 'Favorites',
        icon: Heart,
        href: '/new-dashboard/user/favorites',
        visibility: MENU_VISIBILITY.ALL,
      },
      {
        id: 'gifted',
        title: 'Gifted Messages',
        icon: Gift,
        href: '/new-dashboard/user/gifted',
        visibility: MENU_VISIBILITY.ALL,
      },
      {
        id: 'subscription',
        title: 'Subscription',
        icon: CreditCard,
        href: '/new-dashboard/user/premium',
        visibility: MENU_VISIBILITY.ALL,
      },
    ],
  
    // Admin menu items (separate section)
    adminMenuItems: [
      {
        id: 'admin-dashboard',
        title: 'Admin Dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
        visibility: MENU_VISIBILITY.ADMIN,
      },
      {
        id: 'admin-users',
        title: 'Users',
        icon: Users,
        href: '/admin/users',
        visibility: MENU_VISIBILITY.ADMIN,
      },
      {
        id: 'admin-tags',
        title: 'Tags',
        icon: Tag,
        href: '/admin/tags',
        visibility: MENU_VISIBILITY.ADMIN,
      },
      {
        id: 'admin-orders',
        title: 'Orders',
        icon: ShoppingBag,
        href: '/admin/orders',
        visibility: MENU_VISIBILITY.ADMIN,
      },
      {
        id: 'admin-settings',
        title: 'Settings',
        icon: Settings,
        href: '/admin/settings',
        visibility: MENU_VISIBILITY.ADMIN,
      },
    ],
  
    // Upgrade card configuration
    upgradeCard: {
      free: {
        title: 'Unlock Unlimited Inspiration',
        description: 'Get unlimited quotes and all categories.',
        ctaText: 'Upgrade Now',
        ctaHref: '/subscription',
        show: true,
      },
      trial: {
        title: 'Your Trial is Active!',
        description: 'Enjoy all premium features. Upgrade anytime.',
        ctaText: 'Upgrade Now',
        ctaHref: '/subscription',
        show: true,
      },
      expired: {
        title: 'Subscription Expired',
        description: 'Renew your subscription to continue enjoying premium features.',
        ctaText: 'Renew Now',
        ctaHref: '/subscription',
        show: true,
      },
      premium: {
        title: 'You\'re a Premium Member!',
        description: 'Thank you for supporting us.',
        ctaText: 'Manage Subscription',
        ctaHref: '/subscription',
        show: false,
      },
      admin: {
        title: 'Admin Panel',
        description: 'Manage your platform.',
        ctaText: 'Go to Admin',
        ctaHref: '/admin/dashboard',
        show: false,
      },
    },
  
    // Profile configuration
    profile: {
      showMemberSince: true,
      showSubscription: true,
    },
  };
  
  /**
   * Menu icons mapping (for dynamic imports)
   */
  export const ICON_MAP = {
    Home,
    Quote,
    Sparkles,
    QrCode,
    Heart,
    Gift,
    BookOpen,
    CreditCard,
    Settings,
    Users,
    LayoutDashboard,
    Tag,
    ShoppingBag,
  };
  
  export default SIDEBAR_CONFIG;