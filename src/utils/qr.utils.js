/**
 * QR Utility Functions
 */

export const QR_STATUS = {
    LOADING: 'loading',
    NOT_FOUND: 'not_found',
    DISABLED: 'disabled',
    NEEDS_ACTIVATION: 'needs_activation',
    READY: 'ready',
    ERROR: 'error',
  };
  
  export const CATEGORY_LABELS = {
    love: 'Love ♥',
    strength: 'Strength ◐',
    healing: 'Healing ✦',
    faith: 'Faith ☾',
    gratitude: 'Gratitude ☀',
    personal: 'Personal ♥',
  };
  
  export const DEFAULT_IMAGES = {
    love: '/images/quote-bg/love.jpg',
    strength: '/images/quote-bg/strength.jpg',
    healing: '/images/quote-bg/healing.jpg',
    faith: '/images/quote-bg/faith.jpg',
    gratitude: '/images/quote-bg/gratitude.jpg',
    personal: '/images/quote-bg/peace.jpg',
  };
  
  export const getCategoryLabel = (category) => {
    return CATEGORY_LABELS[category] || CATEGORY_LABELS.love;
  };
  
  export const getBackgroundImage = (category, customImage) => {
    if (customImage) return customImage;
    return DEFAULT_IMAGES[category] || DEFAULT_IMAGES.love;
  };
  
  export const formatQuoteForShare = (quote, author) => {
    return `"${quote}" — ${author || 'InspireTag'}`;
  };
  
  export const isQuoteValid = (quote) => {
    return quote && typeof quote === 'object' && quote.text && quote.text.trim().length > 0;
  };
