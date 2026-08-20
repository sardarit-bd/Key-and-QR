import api from '@/lib/api';

/**
 * Hero Section Service
 * Public GET /hero (singleton content) + Admin PUT /hero and upload.
 */
export const heroService = {
  /**
   * Get the public hero content (singleton).
   * GET /hero
   */
  getHero: async () => {
    const response = await api.get('/hero');
    return response.data; // { success, message, data }
  },

  /**
   * Update the hero content (admin only).
   * PUT /hero
   */
  updateHero: async (payload) => {
    const response = await api.put('/hero', payload);
    return response.data; // { success, message, data }
  },

  /**
   * Upload a new hero image (admin only).
   * POST /hero/upload-image → { url, publicId }
   */
  uploadHeroImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/hero/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
};

export default heroService;
