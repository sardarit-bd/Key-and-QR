import api from '@/lib/api';

/**
 * Gift Message Service
 * Handles all gift message API calls
 */
export const giftMessageService = {
  /**
   * Get personal message by tag code
   * GET /tags/:tagCode/personal-message
   */
  getPersonalMessage: async (tagCode) => {
    try {
      const response = await api.get(`/tags/${tagCode}/personal-message`);
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch personal message',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Set personal message
   * PUT /tags/:tagCode/personal-message
   */
  setPersonalMessage: async (tagCode, message) => {
    try {
      const response = await api.put(`/tags/${tagCode}/personal-message`, { message });
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save personal message',
        status: error.response?.status || 500,
        data: null,
      };
    }
  },

  /**
   * Remove personal message
   * PUT /tags/:tagCode/personal-message with empty message
   */
  removePersonalMessage: async (tagCode) => {
    try {
      const response = await api.put(`/tags/${tagCode}/personal-message`, { message: null });
      return {
        success: true,
        data: response.data?.data || null,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove personal message',
        status: error.response?.status || 500,
      };
    }
  },
};

export default giftMessageService;