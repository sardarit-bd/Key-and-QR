'use client';

import {
  getPrettyCategoryLabel,
  resolveBackgroundImage,
} from '@/components/public/quote/category';

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
  bible: 'Bible ✝',
  gratitude: 'Gratitude ☀',
  personal: 'Personal ♥',
};

export const DEFAULT_IMAGES = {};

export const getCategoryLabel = (category) => {
  return getPrettyCategoryLabel(category);
};

export const getBackgroundImage = (category, customImage) => {
  return resolveBackgroundImage(category, customImage);
};

export const formatQuoteForShare = (quote, author) => {
  return `"${quote}" — ${author || 'InspireTag'}`;
};

export const isQuoteValid = (quote) => {
  return quote && typeof quote === 'object' && quote.text && quote.text.trim().length > 0;
};
