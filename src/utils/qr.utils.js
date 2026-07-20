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
    faith: 'Faith ☾',
    love: 'Love ♥',
    hope: 'Healing ✦',
    success: 'Success ☆',
    motivation: 'Strength ◐',
    personal: 'Personal ♥',
  };
  
  export const DEFAULT_IMAGES = {
    faith: '/images/quote-bg/faith.jpg',
    love: '/images/quote-bg/love.jpg',
    hope: '/images/quote-bg/healing.jpg',
    success: '/images/quote-bg/success.jpg',
    motivation: '/images/quote-bg/strength.jpg',
    personal: '/images/quote-bg/peace.jpg',
  };
  
  export const getCategoryLabel = (category) => {
    return CATEGORY_LABELS[category] || CATEGORY_LABELS.faith;
  };
  
  export const getBackgroundImage = (category, customImage) => {
    if (customImage) return customImage;
    return DEFAULT_IMAGES[category] || DEFAULT_IMAGES.faith;
  };
  
  export const formatQuoteForShare = (quote, author) => {
    return `"${quote}" — ${author || 'InspireTag'}`;
  };
  
  export const isQuoteValid = (quote) => {
    return quote && typeof quote === 'object' && quote.text && quote.text.trim().length > 0;
  };