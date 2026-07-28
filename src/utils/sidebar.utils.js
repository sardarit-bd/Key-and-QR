import { SUBSCRIPTION_PLANS, MENU_VISIBILITY } from '@/config/sidebar.config';

/**
 * Determine user subscription plan
 *
 * Priority:
 * 1. Admin Role
 * 2. Active Subscription
 * 3. Trial Subscription
 * 4. User Premium Flags
 * 5. Expired Subscription
 * 6. Free
 */
export const getUserPlan = (user = null, subscriptions = []) => {
  // Admin
  if (
    user?.role === 'admin' ||
    user?.role === 'ADMIN'
  ) {
    return SUBSCRIPTION_PLANS.ADMIN;
  }

  // Normalize subscriptions
  const subscriptionList = Array.isArray(subscriptions)
    ? subscriptions
    : [];

  // Active subscription
  const activeSubscription = subscriptionList.find(
    (sub) =>
      sub?.status === 'active' ||
      sub?.status === 'ACTIVE'
  );

  if (activeSubscription) {
    return SUBSCRIPTION_PLANS.PREMIUM;
  }

  // Trial subscription
  const trialSubscription = subscriptionList.find(
    (sub) =>
      sub?.status === 'trialing' ||
      sub?.status === 'trial'
  );

  if (trialSubscription) {
    return SUBSCRIPTION_PLANS.TRIAL;
  }

  /**
   * Fallback from user object
   */

  if (
    user?.isPremium === true ||
    user?.premium === true ||
    user?.plan === 'premium' ||
    user?.plan === 'PREMIUM' ||
    user?.subscriptionPlan === 'premium' ||
    user?.subscriptionPlan === 'PREMIUM' ||
    user?.subscriptionStatus === 'active' ||
    user?.subscriptionStatus === 'ACTIVE'
  ) {
    return SUBSCRIPTION_PLANS.PREMIUM;
  }

  // Expired
  const expiredSubscription = subscriptionList.find(
    (sub) =>
      sub?.status === 'expired' ||
      sub?.status === 'canceled' ||
      sub?.status === 'cancelled'
  );

  if (expiredSubscription) {
    return SUBSCRIPTION_PLANS.EXPIRED;
  }

  return SUBSCRIPTION_PLANS.FREE;
};

/**
 * Check if menu item should be visible
 */
export const isMenuItemVisible = (item, userPlan) => {
  const { visibility } = item;

  if (
    visibility === MENU_VISIBILITY.ALL ||
    visibility === MENU_VISIBILITY.AUTHENTICATED
  ) {
    return true;
  }

  if (visibility === MENU_VISIBILITY.PREMIUM) {
    return (
      userPlan === SUBSCRIPTION_PLANS.PREMIUM ||
      userPlan === SUBSCRIPTION_PLANS.TRIAL
    );
  }

  if (visibility === MENU_VISIBILITY.ADMIN) {
    return userPlan === SUBSCRIPTION_PLANS.ADMIN;
  }

  if (visibility === MENU_VISIBILITY.FREE) {
    return userPlan === SUBSCRIPTION_PLANS.FREE;
  }

  return true;
};

/**
 * Filter sidebar menu
 */
/**
 * Determine dashboard context from pathname.
 * Returns 'admin' | 'user' | null
 */
const getDashboardContext = (pathname) => {
  if (!pathname) return null;
  if (pathname.startsWith('/new-dashboard/admin') || pathname.startsWith('/dashboard/admin')) {
    return 'admin';
  }
  if (pathname.startsWith('/new-dashboard') || pathname.startsWith('/dashboard')) {
    return 'user';
  }
  return null;
};

/**
 * Filter sidebar menu items based on user plan and current dashboard context.
 *
 * - Admin users in admin context → only admin items
 * - Admin users in user context → only user items
 * - Non-admin users → only user items (admin items excluded by visibility)
 */
export const getFilteredMenuItems = (
  menuItems,
  userPlan,
  adminItems = [],
  pathname = null
) => {
  const context = getDashboardContext(pathname);
  const isAdmin = userPlan === SUBSCRIPTION_PLANS.ADMIN;

  // Admin in admin dashboard → show ONLY admin menu
  if (isAdmin && context === 'admin') {
    return adminItems.filter((item) =>
      isMenuItemVisible(item, userPlan)
    );
  }

  // Admin in user dashboard → show ONLY user menu
  // Non-admin users → show user menu (admin items filtered by visibility)
  return menuItems.filter((item) =>
    isMenuItemVisible(item, userPlan)
  );
};

/**
 * Upgrade card config
 */
export const getUpgradeCardConfig = (
  userPlan,
  upgradeConfig
) => {
  const map = {
    [SUBSCRIPTION_PLANS.FREE]: 'free',
    [SUBSCRIPTION_PLANS.PREMIUM]: 'premium',
    [SUBSCRIPTION_PLANS.TRIAL]: 'trial',
    [SUBSCRIPTION_PLANS.EXPIRED]: 'expired',
    [SUBSCRIPTION_PLANS.ADMIN]: 'admin',
  };

  return (
    upgradeConfig[map[userPlan]] ??
    upgradeConfig.free
  );
};

/**
 * Subscription badge display
 */
export const getSubscriptionDisplay = (userPlan) => {
  switch (userPlan) {
    case SUBSCRIPTION_PLANS.PREMIUM:
      return {
        label: 'Premium Plan',
        badgeColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
      };

    case SUBSCRIPTION_PLANS.TRIAL:
      return {
        label: 'Trial Plan',
        badgeColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      };

    case SUBSCRIPTION_PLANS.EXPIRED:
      return {
        label: 'Expired Plan',
        badgeColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      };

    case SUBSCRIPTION_PLANS.ADMIN:
      return {
        label: 'Administrator',
        badgeColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
      };

    default:
      return {
        label: 'Free Plan',
        badgeColor: 'text-gray-300',
        bgColor: 'bg-[#1e2337]',
        borderColor: 'border-[#2d344d]',
      };
  }
};

/**
 * Format member since
 */
export const formatMemberSince = (createdAt) => {
  if (!createdAt) return null;

  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Get user initials
 */
export const getUserInitials = (name) => {
  if (!name) return 'U';

  const parts = name.trim().split(' ');

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};