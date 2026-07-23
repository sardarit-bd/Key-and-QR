import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Favorite Store
 * Manages optimistic updates and state sync
 */
export const useFavoriteStore = create(
  persist(
    (set, get) => ({
      // State
      favorites: {},
      stats: { total: 0, products: 0, quotes: 0 },
      isLoading: false,
      error: null,

      // Actions
      addFavorite: (id, favorite) => {
        set((state) => ({
          favorites: { ...state.favorites, [id]: favorite },
          stats: {
            ...state.stats,
            total: state.stats.total + 1,
            quotes: state.stats.quotes + 1,
          }
        }));
      },

      removeFavorite: (id) => {
        set((state) => {
          const newFavorites = { ...state.favorites };
          delete newFavorites[id];
          return {
            favorites: newFavorites,
            stats: {
              ...state.stats,
              total: Math.max(0, state.stats.total - 1),
              quotes: Math.max(0, state.stats.quotes - 1),
            }
          };
        });
      },

      setFavorites: (favoritesList) => {
        const favorites = {};
        favoritesList.forEach(item => {
          const key = item.quote?._id || item.product?._id;
          if (key) {
            favorites[key] = item;
          }
        });
        set({ favorites });
      },

      updateStats: (stats) => {
        set({ stats });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      isFavorited: (id) => {
        return !!get().favorites[id];
      },

      getFavorite: (id) => {
        return get().favorites[id] || null;
      },

      reset: () => {
        set({
          favorites: {},
          stats: { total: 0, products: 0, quotes: 0 },
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'favorite-storage',
    }
  )
);