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
   * Derived from the user's actual subscription — the feature cards
   * keep their exact existing design, but their content comes from
   * the backend plan (free vs subscriber) instead of a static list.
   */
  getPremiumFeatures: async () => {
    try {
      const response = await api.get('/subscriptions/me');
      const subscriptions = response.data?.data || [];

      const isPremium = subscriptions.some(
        (sub) =>
          sub.subscriptionType === 'subscriber' &&
          ['active', 'trialing', 'past_due'].includes(sub.status)
      );

      const base = [
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
      ];

      // Free users see the same cards with availability locked by plan.
      return {
        success: true,
        data: base.map((feature) => ({
          ...feature,
          available: isPremium ? true : feature.id === 'unlimited-quotes',
        })),
      };
    } catch (error) {
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
    }
  },

  /**
   * Create Stripe Billing Portal session
   * POST /subscriptions/create-portal-session
   */
  createPortalSession: async () => {
    try {
      const response = await api.post('/subscriptions/create-portal-session');
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create portal session',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Get the latest paid invoice PDF URL.
   * GET /subscriptions/latest-invoice
   */
  getLatestInvoice: async () => {
    try {
      const response = await api.get('/subscriptions/latest-invoice');
      return {
        success: true,
        data: response.data?.data || { invoicePdf: null, hostedInvoiceUrl: null },
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch invoice',
        status: error.response?.status || 500,
        data: { invoicePdf: null, hostedInvoiceUrl: null },
      };
    }
  },
};

export default premiumService;