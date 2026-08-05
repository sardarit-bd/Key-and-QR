'use client';

/**
 * Central slug → fallback background image map.
 *
 * When a quote has no custom image, cards look up a themed default by
 * category slug. Single source of truth for these fallback images across
 * My Quotes, Favorites, Scan History, and the public/QR scan flows.
 */

export const CATEGORY_BACKGROUND_IMAGES = {
  love: '/images/quote-bg/love.jpg',
  strength: '/images/quote-bg/strength.jpg',
  healing: '/images/quote-bg/healing.jpg',
  faith: '/images/quote-bg/faith.jpg',
  gratitude: '/images/quote-bg/gratitude.jpg',
  motivation: '/images/quote-bg/strength.jpg',
  personal: '/images/quote-bg/peace.jpg',
};

export const FALLBACK_BACKGROUND_IMAGE = '/images/quote-bg/faith.jpg';

export function getCategoryBackgroundImage(slug) {
  if (!slug) return FALLBACK_BACKGROUND_IMAGE;
  return (
    CATEGORY_BACKGROUND_IMAGES[String(slug).toLowerCase()] ||
    FALLBACK_BACKGROUND_IMAGE
  );
}

export function resolveBackgroundImage(category, customImage) {
  if (customImage) return customImage;
  return getCategoryBackgroundImage(category);
}
