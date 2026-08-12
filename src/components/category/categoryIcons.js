'use client';

import {
  CATEGORY_ICON_REGISTRY,
  CATEGORY_ICON_FALLBACK,
  resolveCategoryIcon,
  isKnownCategoryIcon,
} from '@/components/dashboard/admin/categories/categoryIconRegistry';

/**
 * Shared category icon map — thin facade over the CENTRAL icon registry
 * (src/components/dashboard/admin/categories/categoryIconRegistry.js).
 *
 * ONE canonical source of truth: the same category always resolves to the
 * same icon everywhere (admin table, picker, submit quote, dashboard,
 * collection, filters). Keys are category slugs (the same slugs stored on
 * quotes / received by the backend). New categories created through the
 * Category API that have no saved icon gracefully fall back to the shared
 * fallback — no per-page icon constants anywhere.
 */

// Slug → icon lookup. A slug resolves to a Lucide icon only when an icon
// exists under that exact name (e.g. "love" → Heart, "shield" → Shield).
// Otherwise the shared fallback is used. This keeps the legacy
// `CATEGORY_ICONS[slug]` access pattern working while being derived from the
// single central registry.
export const CATEGORY_ICONS = Object.fromEntries(
  Object.keys(CATEGORY_ICON_REGISTRY).map((name) => [
    name,
    CATEGORY_ICON_REGISTRY[name],
  ])
);

export const FALLBACK_ICON = CATEGORY_ICON_FALLBACK;

export function getCategoryIcon(slug) {
  if (!slug) return FALLBACK_ICON;
  return resolveCategoryIcon(slug) || FALLBACK_ICON;
}

export { CATEGORY_ICON_REGISTRY, isKnownCategoryIcon };
