import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { qrService } from '@/services/qr.service';
import { useAuthStore } from '@/store/authStore';

/**
 * Custom hook for QR resolution
 * Handles loading, error, and success states
 */
export const useQRResolution = (tagCode) => {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  const [state, setState] = useState({
    status: 'loading', // loading | not_found | disabled | needs_activation | ready | error
    data: null,
    error: null,
    isFavorite: false,
    favoriteId: null,
  });

  const [loading, setLoading] = useState(true);

  /**
   * Resolve QR code
   */
  const resolveQR = useCallback(async () => {
    if (!tagCode) {
      setState({
        status: 'not_found',
        data: null,
        error: 'Invalid QR code',
        isFavorite: false,
        favoriteId: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setState(prev => ({ ...prev, status: 'loading' }));

    const result = await qrService.resolveTag(tagCode);

    if (!result.success) {
      let status = 'error';
      
      // Map error codes to UI states
      if (result.status === 404) {
        status = 'not_found';
      } else if (result.status === 400) {
        if (result.code === 'TAG_INACTIVE' || result.code === 'TAG_NOT_ACTIVATED') {
          status = 'disabled';
        } else {
          status = 'not_found';
        }
      }

      setState({
        status,
        data: result.data,
        error: result.message,
        isFavorite: false,
        favoriteId: null,
      });
      setLoading(false);
      return;
    }

    const tagData = result.data;
    
    // Determine display status from API response
    let displayStatus = 'ready';
    
    if (tagData?.status === 'NEEDS_ACTIVATION') {
      displayStatus = 'needs_activation';
    } else if (tagData?.status === 'DISABLED') {
      displayStatus = 'disabled';
    } else if (!tagData?.isActive) {
      displayStatus = 'disabled';
    } else if (!tagData?.isActivated) {
      displayStatus = 'needs_activation';
    }

    // Check if quote is favorited (if user is logged in and quote exists)
    let isFavorite = false;
    let favoriteId = null;
    
    if (isInitialized && user && tagData?.quote?._id) {
      const favoriteResult = await qrService.checkFavorite(tagData.quote._id);
      if (favoriteResult.success) {
        isFavorite = favoriteResult.data?.exists || false;
        favoriteId = favoriteResult.data?.favoriteId || null;
      }
    }

    setState({
      status: displayStatus,
      data: tagData,
      error: null,
      isFavorite,
      favoriteId,
    });
    setLoading(false);
  }, [tagCode, isInitialized, user]);

  /**
   * Refresh QR data
   */
  const refresh = useCallback(() => {
    resolveQR();
  }, [resolveQR]);

  /**
   * Toggle favorite
   */
  const toggleFavorite = useCallback(async () => {
    if (!isInitialized || !user) {
      // Redirect to login
      router.push(`/login?redirect=/tag/${tagCode}`);
      return false;
    }

    if (!state.data?.quote?._id) {
      return false;
    }

    const quoteId = state.data.quote._id;

    try {
      if (state.isFavorite && state.favoriteId) {
        // Remove favorite
        const response = await api.delete(`/favorites/${state.favoriteId}`);
        if (response.status === 200 || response.status === 204) {
          setState(prev => ({
            ...prev,
            isFavorite: false,
            favoriteId: null,
          }));
          return true;
        }
      } else {
        // Add favorite
        const response = await api.post('/favorites', { quoteId });
        if (response.status === 201 || response.status === 200) {
          const newFavorite = response.data?.data;
          setState(prev => ({
            ...prev,
            isFavorite: true,
            favoriteId: newFavorite?._id || null,
          }));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Favorite toggle failed:', error);
      return false;
    }
  }, [state.isFavorite, state.favoriteId, state.data, isInitialized, user, router, tagCode]);

  /**
   * Handle personal message modal
   */
  const showPersonalMessage = useCallback(() => {
    if (state.data?.hasPersonalMessage && state.data?.personalMessage) {
      return true;
    }
    return false;
  }, [state.data]);

  // Initial resolution
  useEffect(() => {
    resolveQR();
  }, [resolveQR]);

  return {
    ...state,
    loading,
    refresh,
    toggleFavorite,
    showPersonalMessage,
    isAuthenticated: isInitialized && !!user,
    user,
    tagCode,
  };
};

export default useQRResolution;