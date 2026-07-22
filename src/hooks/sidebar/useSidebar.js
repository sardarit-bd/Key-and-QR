import { useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { 
  SIDEBAR_CONFIG, 
  SUBSCRIPTION_PLANS 
} from '@/config/sidebar.config';
import {
  getUserPlan,
  getFilteredMenuItems,
  getUpgradeCardConfig,
  getSubscriptionDisplay,
  formatMemberSince,
  getUserInitials,
} from '@/utils/sidebar.utils';

/**
 * Custom hook for sidebar data and logic
 */
export const useSidebar = () => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  // ✅ Single source of truth for subscription data — same store the
  // Subscription page and Dashboard Header read from.
  const { mySubscriptions, fetchMySubscriptions } = useSubscriptionStore();
  const subscriptions = mySubscriptions;

  // Ensure subscription data is loaded whenever the sidebar mounts,
  // instead of relying on some other component having fetched it first.
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) return;

    fetchMySubscriptions();
  }, [user, isInitialized, fetchMySubscriptions]);

  // Determine user plan
  const userPlan = useMemo(() => {
    if (!user) return SUBSCRIPTION_PLANS.FREE;
    // ✅ getUserPlan expects (user, subscriptions) — previously only
    // `subscriptions` was passed, so it was being read as `user` and the
    // real subscriptions list was always empty, causing a FREE fallback.
    return getUserPlan(user, subscriptions);
  }, [user, subscriptions]);

  // Get filtered menu items
  const menuItems = useMemo(() => {
    const { menuItems, adminMenuItems } = SIDEBAR_CONFIG;
    return getFilteredMenuItems(menuItems, userPlan, adminMenuItems);
  }, [userPlan]);

  // Get upgrade card config
  const upgradeCard = useMemo(() => {
    const config = getUpgradeCardConfig(userPlan, SIDEBAR_CONFIG.upgradeCard);
    return config;
  }, [userPlan]);

  // Get subscription display info
  const subscriptionDisplay = useMemo(() => {
    return getSubscriptionDisplay(userPlan);
  }, [userPlan]);

  // Get user profile data
  const profile = useMemo(() => {
    return {
      name: user?.name || 'User',
      email: user?.email || 'user@example.com',
      initials: getUserInitials(user?.name),
      avatar: user?.profileImage || null,
      memberSince: formatMemberSince(user?.createdAt),
      plan: userPlan,
      subscriptionLabel: subscriptionDisplay.label,
      badgeColor: subscriptionDisplay.badgeColor,
      bgColor: subscriptionDisplay.bgColor,
      borderColor: subscriptionDisplay.borderColor,
    };
  }, [user, userPlan, subscriptionDisplay]);

  // Check if user is premium
  const isPremium = useMemo(() => {
    return userPlan === SUBSCRIPTION_PLANS.PREMIUM || 
           userPlan === SUBSCRIPTION_PLANS.TRIAL;
  }, [userPlan]);

  // Check if upgrade card should be shown
  const shouldShowUpgrade = useMemo(() => {
    return upgradeCard?.show !== false;
  }, [upgradeCard]);

  // Get active subscription
  const activeSubscription = useMemo(() => {
    return subscriptions?.find(
      (sub) => sub.status === 'active' || sub.status === 'trialing'
    ) || null;
  }, [subscriptions]);

  return {
    user,
    subscriptions,
    userPlan,
    menuItems,
    upgradeCard,
    profile,
    isPremium,
    isAuthenticated,
    isLoading,
    shouldShowUpgrade,
    activeSubscription,
    subscriptionDisplay,
  };
};

export default useSidebar;