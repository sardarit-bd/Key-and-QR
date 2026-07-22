import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import api from '@/lib/api';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook for favorite functionality
 * Handles toggle, optimistic updates, and error handling
 */
export const useFavorite = (options = {}) => {
  const {
    id,
    type = 'quote', // 'quote' or 'product'
    onSuccess,
    onError,
  } = options;

  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  
  // Use shallow comparison for performance
  const { 
    isFavorited, 
    getFavorite, 
    addFavorite, 
    removeFavorite,
    stats,
    setLoading,
    setError,
    clearError,
  } = useFavoriteStore(
    useShallow((state) => ({
      isFavorited: state.isFavorited,
      getFavorite: state.getFavorite,
      addFavorite: state.addFavorite,
      removeFavorite: state.removeFavorite,
      stats: state.stats,
      setLoading: state.setLoading,
      setError: state.setError,
      clearError: state.clearError,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState(null);

  // Check if item is favorited
  const isFav = id ? isFavorited(id) : false;
  const favorite = id ? getFavorite(id) : null;

  /**
   * Toggle favorite
   */
  const toggleFavorite = useCallback(async () => {
    if (!id) {
      toast.error('Invalid item');
      return false;
    }

    // Check authentication
    if (!user) {
      // Store the current page for redirect
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return false;
    }

    setIsLoading(true);
    setLocalError(null);
    setLoading(true);

    try {
      if (isFav) {
        // Remove favorite
        if (!favorite?._id) {
          throw new Error('Favorite not found');
        }

        const response = await api.delete(`/favorites/${favorite._id}`);
        
        if (response.status === 200 || response.status === 204) {
          // Optimistic update - remove
          removeFavorite(id);
          toast.success('Removed from favorites');
          
          if (onSuccess) {
            onSuccess({ action: 'remove', favorite: response.data?.data });
          }
          return true;
        } else {
          throw new Error('Failed to remove favorite');
        }
      } else {
        // Add favorite
        const payload = type === 'quote' 
          ? { quoteId: id } 
          : { productId: id };

        const response = await api.post('/favorites', payload);
        
        if (response.status === 201 || response.status === 200) {
          const newFavorite = response.data?.data;
          // Optimistic update - add
          addFavorite(id, newFavorite);
          toast.success('Added to favorites');
          
          if (onSuccess) {
            onSuccess({ action: 'add', favorite: newFavorite });
          }
          return true;
        } else {
          throw new Error('Failed to add favorite');
        }
      }
    } catch (err) {
      // Error handling
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update favorites';
      setLocalError(errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (onError) {
        onError(err);
      }
      return false;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [id, type, isFav, favorite, user, router, addFavorite, removeFavorite, setLoading, setError, onSuccess, onError]);

  /**
   * Check favorite status
   */
  const checkFavorite = useCallback(async () => {
    if (!id || !user) return;

    try {
      const params = type === 'quote' 
        ? { quoteId: id } 
        : { productId: id };
      
      const response = await api.get('/favorites/check', { params });
      
      if (response.data?.data?.exists) {
        // Add to store if not already present
        if (!isFavorited(id)) {
          addFavorite(id, { _id: response.data.data.favoriteId, [type]: { _id: id } });
        }
      }
    } catch (error) {
      // Silently fail for check
      console.debug('Failed to check favorite status:', error);
    }
  }, [id, type, user, isFavorited, addFavorite]);

  // Check favorite status on mount
  useEffect(() => {
    if (id && isInitialized && user) {
      checkFavorite();
    }
  }, [id, isInitialized, user, checkFavorite]);

  return {
    isFavorite: isFav,
    favorite,
    isLoading,
    error,
    toggleFavorite,
    checkFavorite,
    stats,
  };
};

export default useFavorite;