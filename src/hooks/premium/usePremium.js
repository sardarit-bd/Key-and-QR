import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import premiumService from '@/services/premium-service/premium.service';

/**
 * Custom hook for premium functionality
 */
export const usePremium = () => {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('random');
  const [error, setError] = useState(null);
  const [premiumFeatures, setPremiumFeatures] = useState([]);

  // Check authentication
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login?redirect=/dashboard/premium');
    }
  }, [isInitialized, user, router]);

  /**
   * Fetch user's subscription status
   */
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await premiumService.getMySubscriptions();
      
      if (result.success) {
        const subs = result.data || [];
        setSubscriptions(subs);
        
        // Check if any subscription is active
        const hasActive = subs.some(
          sub => sub.status === 'active' || sub.status === 'trialing'
        );
        setIsPremium(hasActive);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Fetch premium features
   */
  const fetchPremiumFeatures = useCallback(async () => {
    const result = await premiumService.getPremiumFeatures();
    if (result.success) {
      setPremiumFeatures(result.data);
    }
  }, []);

  /**
   * Fetch a new quote
   */
  const fetchQuote = useCallback(async (category = selectedCategory) => {
    if (!user) return;

    setQuoteLoading(true);

    try {
      const result = await premiumService.getPremiumQuote(
        category !== 'random' ? category : null
      );
      
      if (result.success && result.data) {
        setCurrentQuote(result.data);
      } else {
        toast.error(result.message || 'Failed to load quote');
      }
    } catch (err) {
      toast.error('Failed to load quote');
    } finally {
      setQuoteLoading(false);
    }
  }, [user, selectedCategory]);

  /**
   * Load a new quote (for premium users)
   */
  const loadNewQuote = useCallback(async () => {
    if (!isPremium) {
      toast.error('Please upgrade to premium for unlimited quotes');
      return;
    }
    await fetchQuote();
  }, [isPremium, fetchQuote]);

  /**
   * Change category and load new quote
   */
  const changeCategory = useCallback(async (category) => {
    setSelectedCategory(category);
    if (isPremium) {
      await fetchQuote(category);
    }
  }, [isPremium, fetchQuote]);

  /**
   * Get active subscription
   */
  const getActiveSubscription = useCallback(() => {
    return subscriptions.find(
      sub => sub.status === 'active' || sub.status === 'trialing'
    ) || null;
  }, [subscriptions]);

  /**
   * Get subscription status display
   */
  const getSubscriptionStatus = useCallback(() => {
    const active = getActiveSubscription();
    if (!active) return null;
    
    return {
      type: active.subscriptionType || 'subscriber',
      status: active.status,
      currentPeriodEnd: active.currentPeriodEnd,
      cancelAtPeriodEnd: active.cancelAtPeriodEnd,
    };
  }, [getActiveSubscription]);

  // Initial data fetch
  useEffect(() => {
    if (user && isInitialized) {
      fetchSubscriptionStatus();
      fetchPremiumFeatures();
      fetchQuote('random');
    }
  }, [user, isInitialized, fetchSubscriptionStatus, fetchPremiumFeatures, fetchQuote]);

  return {
    loading,
    isPremium,
    subscriptions,
    currentQuote,
    quoteLoading,
    selectedCategory,
    error,
    premiumFeatures,
    fetchQuote,
    loadNewQuote,
    changeCategory,
    getActiveSubscription,
    getSubscriptionStatus,
    isAuthenticated: !!user,
    user,
  };
};

export default usePremium;