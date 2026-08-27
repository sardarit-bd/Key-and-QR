'use client';

/**
 * Category background image resolver.
 *
 * Returns customImage if provided and valid (e.g. Cloudinary HTTPS or valid public path).
 * Returns null when no custom image is available so UI components render clean CSS
 * theme gradients instead of requesting non-existent local image paths that cause 404 errors.
 */

export const CATEGORY_BACKGROUND_IMAGES = {};

export const FALLBACK_BACKGROUND_IMAGE = null;

export function getCategoryBackgroundImage(slug) {
  return null;
}

export function resolveBackgroundImage(category, customImage) {
  if (!customImage) return null;
  if (typeof customImage !== 'string') return null;
  const trimmed = customImage.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    (trimmed.startsWith('/') && !trimmed.startsWith('/images/quote-bg/'))
  ) {
    return trimmed;
  }
  return null;
}
