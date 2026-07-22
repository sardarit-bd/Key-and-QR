import api from '@/lib/api';

/**
 * Premium Service
 * Handles all premium/subscription API calls
 */
export const premiumService = {
  /**
   * Get user's subscriptions
   * GET /subscriptions/me
   */
  getMySubscriptions: async () => {
    try {
      const response = await api.get('/subscriptions/me');
      return {
        success: true,
        data: response.data?.data || [],
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch subscriptions',
        status: error.response?.status || 500,
        data: [],
      };
    }
  },

  /**
   * Get random quote (with category filter for premium)
   * GET /quotes/random?category=xxx
   */
  getRandomQuote: async (category = null) => {
    try {
      const queryParams = category && category !== 'random' 
        ? `?category=${category}` 
        : '';
      const response = await api.get(`/quotes/random${queryParams}`);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quote',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Get premium quote (unlimited access)
   * This is the same as random quote but with premium flags
   */
  getPremiumQuote: async (category = null) => {
    try {
      const queryParams = category && category !== 'random' 
        ? `?category=${category}` 
        : '';
      const response = await api.get(`/quotes/random${queryParams}`);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch premium quote',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Check if user has active subscription
   * GET /subscriptions/me (check if any active)
   */
  hasActiveSubscription: async () => {
    try {
      const response = await api.get('/subscriptions/me');
      const subscriptions = response.data?.data || [];
      const hasActive = subscriptions.some(
        sub => sub.status === 'active' || sub.status === 'trialing'
      );
      return {
        success: true,
        data: { hasActive, subscriptions },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        data: { hasActive: false, subscriptions: [] },
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Get premium features
   */
  getPremiumFeatures: async () => {
    // This could be a static list or from API
    return {
      success: true,
      data: [
        {
          id: 'unlimited-quotes',
          title: 'Unlimited Quotes',
          description: 'Get unlimited inspirational quotes every day',
          icon: 'Sparkles',
          available: true,
        },
        {
          id: 'category-explorer',
          title: 'Category Explorer',
          description: 'Browse quotes by your favorite categories',
          icon: 'Compass',
          available: true,
        },
        {
          id: 'unlimited-discover',
          title: 'Unlimited Discover More',
          description: 'Explore endless inspiration without limits',
          icon: 'BookOpen',
          available: true,
        },
        {
          id: 'premium-experience',
          title: 'Premium Experience',
          description: 'Ad-free, premium UI, and exclusive content',
          icon: 'Crown',
          available: true,
        },
      ],
    };
  },
};

export default premiumService;