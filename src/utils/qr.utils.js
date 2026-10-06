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

/**
 * Safely resolves the public base URL for QR codes.
 * Ensures localhost is never embedded when running on a production/remote domain.
 */
export const getPublicQrBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_FRONTEND_URL || '';
  }

  const configuredUrl = process.env.NEXT_PUBLIC_FRONTEND_URL?.trim();
  const currentOrigin = window.location.origin;
  const isCurrentOriginLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  // If no configured URL, fallback to the current browser origin
  if (!configuredUrl) {
    return currentOrigin;
  }

  const isConfiguredUrlLocal =
    configuredUrl.includes('localhost') ||
    configuredUrl.includes('127.0.0.1');

  // If running on a real domain (production/staging) but NEXT_PUBLIC_FRONTEND_URL was set to localhost,
  // prioritize the current browser origin so localhost is never baked into production QR codes.
  if (!isCurrentOriginLocal && isConfiguredUrlLocal) {
    return currentOrigin;
  }

  return configuredUrl;
};

/**
 * Returns the canonical public scan URL for a tag code: /t/[tagCode]
 */
export const getPublicTagUrl = (tagCode) => {
  if (!tagCode) return '';
  const baseUrl = getPublicQrBaseUrl();
  return `${baseUrl}/t/${tagCode}`;
};
