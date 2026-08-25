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
  PenLine,
  Package,
  UserCircle,
  BarChart3,
  MessageSquare,
  CreditCardIcon,
  DollarSign,
  Layers,
  ImageIcon,
  Megaphone,
} from "lucide-react";

/**
 * Subscription Plans
 */
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PREMIUM: "premium",
  TRIAL: "trial",
  EXPIRED: "expired",
  ADMIN: "admin",
};

/**
 * Menu Visibility Rules
 */
export const MENU_VISIBILITY = {
  ALL: "all",
  FREE: "free",
  PREMIUM: "premium",
  ADMIN: "admin",
  AUTHENTICATED: "authenticated",
};

/**
 * Sidebar Configuration
 * Centralized menu configuration
 *
 * 8 sidebar items for user dashboard:
 * 1. Overview
 * 2. Scan History
 * 3. My Quotes
 * 4. Submit Quote
 * 5. Favorites
 * 6. Orders
 * 7. Subscription
 * 8. Profile
 */
export const SIDEBAR_CONFIG = {
  // Menu items configuration
  menuItems: [
    {
      id: "overview",
      title: "Overview",
      icon: LayoutDashboard,
      href: "/new-dashboard/user",
      exact: true,
      visibility: MENU_VISIBILITY.ALL,
    },
    // {
    //   id: "my-qr",
    //   title: "My QR",
    //   icon: QrCode,
    //   href: "/new-dashboard/user/my-qr",
    //   visibility: MENU_VISIBILITY.ALL,
    // },
    {
      id: "scan-history",
      title: "Scan History",
      icon: QrCode,
      href: "/new-dashboard/user/scan-history",
      visibility: MENU_VISIBILITY.ALL,
    },
    {
      id: "favorites",
      title: "Collection",
      icon: Heart,
      href: "/new-dashboard/user/favorites",
      visibility: MENU_VISIBILITY.ALL,
    },
    {
      id: "submit-quote",
      title: "Submit Quote",
      icon: PenLine,
      visibility: MENU_VISIBILITY.ALL,
      children: [
        {
          id: "submit-quote-submit",
          title: "Submit",
          href: "/new-dashboard/user/submit-quote",
          visibility: MENU_VISIBILITY.ALL,
        },
        {
          id: "submission-history",
          title: "Submission History",
          href: "/new-dashboard/user/submit-quote/history",
          visibility: MENU_VISIBILITY.ALL,
        },
      ],
    },
    {
      id: "orders",
      title: "Orders",
      icon: Package,
      href: "/new-dashboard/user/orders",
      visibility: MENU_VISIBILITY.ALL,
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: CreditCard,
      href: "/new-dashboard/user/premium",
      visibility: MENU_VISIBILITY.ALL,
    },
    {
      id: "profile",
      title: "Profile",
      icon: UserCircle,
      href: "/new-dashboard/user/profile",
      visibility: MENU_VISIBILITY.ALL,
    },
  ],

  // Admin menu items (separate section)
  adminMenuItems: [
    {
      id: "admin-dashboard",
      title: "Overview",
      icon: LayoutDashboard,
      href: "/new-dashboard/admin",
      exact: true,
      visibility: MENU_VISIBILITY.ADMIN,
    },
    {
      id: "admin-users",
      title: "Users",
      icon: Users,
      visibility: MENU_VISIBILITY.ADMIN,
      children: [
        {
          id: "admin-users-all",
          title: "All Users",
          href: "/new-dashboard/admin/users",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-users-active",
          title: "Active Users",
          href: "/new-dashboard/admin/users/active",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-users-suspended",
          title: "Suspended Users",
          href: "/new-dashboard/admin/users/suspended",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-users-admins",
          title: "Administrators",
          href: "/new-dashboard/admin/users/admins",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-users-moderators",
          title: "Moderators",
          href: "/new-dashboard/admin/users/moderators",
          visibility: MENU_VISIBILITY.ADMIN,
        },
      ],
    },
    {
      id: "admin-products",
      title: "Products",
      icon: Package,
      href: "/new-dashboard/admin/products",
      visibility: MENU_VISIBILITY.ADMIN,
    },
    {
      id: "admin-orders",
      title: "Orders",
      icon: ShoppingBag,
      visibility: MENU_VISIBILITY.ADMIN,
      children: [
        {
          id: "admin-orders-all",
          title: "All Orders",
          href: "/new-dashboard/admin/orders",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-orders-pending-qr",
          title: "Pending Orders",
          href: "/new-dashboard/admin/orders/pending-qr",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-orders-completed",
          title: "Completed Orders",
          href: "/new-dashboard/admin/orders/completed",
          visibility: MENU_VISIBILITY.ADMIN,
        },
      ],
    },
    {
      id: "admin-tags",
      title: "QR Tags",
      icon: Tag,
      visibility: MENU_VISIBILITY.ADMIN,
      children: [
        {
          id: "admin-tags-all",
          title: "All Tags",
          href: "/new-dashboard/admin/tags",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-tags-assign",
          title: "QR Tag Assign",
          href: "/new-dashboard/admin/assignment",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-tags-assigned",
          title: "QR Tag Assigned",
          href: "/new-dashboard/admin/tags/assigned",
          visibility: MENU_VISIBILITY.ADMIN,
        },
      ],
    },
    {
      id: "admin-quotes",
      title: "Quotes",
      icon: Quote,
      visibility: MENU_VISIBILITY.ADMIN,
      children: [
        {
          id: "admin-quotes-all",
          title: "All Quotes",
          href: "/new-dashboard/admin/quotes",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-visual-quotes",
          title: "Create Quotes",
          href: "/new-dashboard/admin/quotes/create-visual",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-quotes-pending",
          title: "Pending Quotes",
          href: "/new-dashboard/admin/quotes/pending",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-quotes-approved",
          title: "Approved Quotes",
          href: "/new-dashboard/admin/quotes/approved",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-quotes-rejected",
          title: "Rejected Quotes",
          href: "/new-dashboard/admin/quotes/rejected",
          visibility: MENU_VISIBILITY.ADMIN,
        },
      ],
    },
    {
      id: "admin-categories",
      title: "Categories",
      icon: Layers,
      href: "/new-dashboard/admin/categories",
      visibility: MENU_VISIBILITY.ADMIN,
    },
    {
      id: "admin-subscriptions",
      title: "Subscriptions",
      icon: CreditCard,
      href: "/new-dashboard/admin/subscriptions",
      visibility: MENU_VISIBILITY.ADMIN,
    },
    {
      id: "admin-content",
      title: "Content Management",
      icon: ImageIcon,
      visibility: MENU_VISIBILITY.ADMIN,
      children: [
        {
          id: "admin-content-homepage-hero",
          title: "Homepage Hero",
          href: "/new-dashboard/admin/content/homepage-hero",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-content-shop-hero",
          title: "Shop Hero",
          href: "/new-dashboard/admin/content/shop-hero",
          visibility: MENU_VISIBILITY.ADMIN,
        },
        {
          id: "admin-content-announcement",
          title: "Announcement Banner",
          icon: Megaphone,
          href: "/new-dashboard/admin/content/announcement",
          visibility: MENU_VISIBILITY.ADMIN,
        },
      ],
    },
    {
      id: "admin-profile",
      title: "Profile",
      icon: UserCircle,
      href: "/new-dashboard/admin/profile",
      visibility: MENU_VISIBILITY.ADMIN,
    },
  ],

  // Upgrade card configuration
  upgradeCard: {
    free: {
      title: "Unlock Unlimited Inspiration",
      description: "Get unlimited quotes and all categories.",
      ctaText: "Upgrade Now",
      ctaHref: "/new-dashboard/user/premium",
      show: true,
    },
    trial: {
      title: "Your Trial is Active!",
      description: "Enjoy all premium features. Upgrade anytime.",
      ctaText: "Upgrade Now",
      ctaHref: "/new-dashboard/user/premium",
      show: true,
    },
    expired: {
      title: "Subscription Expired",
      description:
        "Renew your subscription to continue enjoying premium features.",
      ctaText: "Renew Now",
      ctaHref: "/new-dashboard/user/premium",
      show: true,
    },
    premium: {
      title: "You're a Premium Member!",
      description: "Thank you for supporting us.",
      ctaText: "Manage Subscription",
      ctaHref: "/new-dashboard/user/premium",
      show: false,
    },
    admin: {
      title: "Admin Panel",
      description: "Manage your platform.",
      ctaText: "Go to Admin",
      ctaHref: "/admin/dashboard",
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
  PenLine,
  Package,
  UserCircle,
  BarChart3,
  MessageSquare,
  CreditCardIcon,
  DollarSign,
  Layers,
  ImageIcon,
};

export default SIDEBAR_CONFIG;
