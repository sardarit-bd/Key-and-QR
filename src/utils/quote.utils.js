/**
 * Quote Utility Functions
 */

export const CATEGORY_COLORS = {
    faith: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    love: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    hope: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    success: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    motivation: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  };
  
  export const CATEGORY_LABELS = {
    faith: 'Faith',
    love: 'Love',
    hope: 'Hope',
    success: 'Success',
    motivation: 'Motivation',
  };
  
  export const DEFAULT_IMAGES = {
    faith: '/images/quote-bg/faith.jpg',
    love: '/images/quote-bg/love.jpg',
    hope: '/images/quote-bg/healing.jpg',
    success: '/images/quote-bg/success.jpg',
    motivation: '/images/quote-bg/strength.jpg',
  };
  
  export const SORT_OPTIONS = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'alphabetical', label: 'A-Z' },
  ];
  
  export const CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    { id: 'faith', label: 'Faith' },
    { id: 'love', label: 'Love' },
    { id: 'hope', label: 'Hope' },
    { id: 'success', label: 'Success' },
    { id: 'motivation', label: 'Motivation' },
  ];
  
  export const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.motivation;
  };
  
  export const getCategoryLabel = (category) => {
    return CATEGORY_LABELS[category] || category;
  };
  
  export const getBackgroundImage = (category, customImage) => {
    if (customImage) return customImage;
    return DEFAULT_IMAGES[category] || DEFAULT_IMAGES.motivation;
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