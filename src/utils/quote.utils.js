/**
 * Quote Utility Functions
 */

export const CATEGORY_COLORS = {
    love: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    strength: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    healing: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    faith: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    gratitude: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  };
  
  export const CATEGORY_LABELS = {
    love: 'Love',
    strength: 'Strength',
    healing: 'Healing',
    faith: 'Faith',
    gratitude: 'Gratitude',
  };
  
  export const DEFAULT_IMAGES = {
    love: '/images/quote-bg/love.jpg',
    strength: '/images/quote-bg/strength.jpg',
    healing: '/images/quote-bg/healing.jpg',
    faith: '/images/quote-bg/faith.jpg',
    gratitude: '/images/quote-bg/gratitude.jpg',
  };
  
  export const SORT_OPTIONS = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'alphabetical', label: 'A-Z' },
  ];
  
  export const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'love', label: 'Love' },
    { id: 'strength', label: 'Strength' },
    { id: 'healing', label: 'Healing' },
    { id: 'faith', label: 'Faith' },
    { id: 'gratitude', label: 'Gratitude' },
  ];
  
  export const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.love;
  };
  
  export const getCategoryLabel = (category) => {
    return CATEGORY_LABELS[category] || category;
  };
  
  export const getBackgroundImage = (category, customImage) => {
    if (customImage) return customImage;
    return DEFAULT_IMAGES[category] || DEFAULT_IMAGES.love;
  };
  
  export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  export const formatQuoteForShare = (quote, author) => {
    return `"${quote}" — ${author || 'InspireTag'}`;
  };
