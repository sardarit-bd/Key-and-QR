'use client';

import { getCategoryLabel } from '@/components/public/quote/category/categoryLabels';
import * as LucideIcons from 'lucide-react';

/**
 * Centralized category icon registry — the SINGLE source of truth for
 * category icons in the entire app.
 *
 * The DATABASE stores only a stable icon NAME string (e.g. "Shield").
 * This module resolves that name to the actual Lucide component.
 * Never store React components / JSX / SVG markup in the database.
 *
 * The full free Lucide set is exposed programmatically (5,000+ icons) so the
 * picker has a large searchable library without a hand-maintained list.
 */

// ---------------------------------------------------------------------------
// 1. FULL LUCIDE ICON SET (programmatic)
// ---------------------------------------------------------------------------
// Build { Name: Component } for every Lucide export. Lucide exports each icon
// twice: "Heart" (canonical) and "HeartIcon" (alias). We keep the canonical
// names (no trailing "Icon") so the DB stores the clean stable key.
export const CATEGORY_ICON_REGISTRY = Object.fromEntries(
  Object.entries(LucideIcons).filter(([name, value]) => {
    // Only forward-ref icon components, drop aliases (*Icon) + non-icons.
    return (
      name !== 'default' &&
      !name.endsWith('Icon') &&
      typeof value === 'object' &&
      value !== null &&
      'render' in value
    );
  })
);

/** All available icon names (canonical), sorted for stable display. */
export const ALL_CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICON_REGISTRY).sort((a, b) =>
  a.localeCompare(b)
);

// ---------------------------------------------------------------------------
// 2. CURATED GROUPS (shown first in the picker; the full set is searchable)
// ---------------------------------------------------------------------------
export const CATEGORY_ICON_GROUPS = [
  {
    label: 'Popular',
    names: [
      'Sparkles', 'Heart', 'Star', 'Target', 'Dumbbell', 'BookOpen', 'Brain',
      'Trophy', 'Shield', 'Flame', 'Feather', 'HeartPulse', 'Sun', 'Moon',
    ],
  },
  {
    label: 'People',
    names: ['User', 'Smile', 'HandHeart', 'HeartHandshake', 'Users', 'Baby', 'PersonStanding'],
  },
  {
    label: 'Objects',
    names: ['Bandage', 'Church', 'Lightbulb', 'Gem', 'Key', 'Zap', 'Wand', 'Anchor'],
  },
  {
    label: 'Communication',
    names: ['Bell', 'Compass', 'Quote', 'MessageCircle', 'MessagesSquare', 'Megaphone', 'Mail', 'Phone'],
  },
  {
    label: 'Media',
    names: ['Music', 'Camera', 'Calendar', 'Clock', 'Play', 'Film', 'Image', 'Palette'],
  },
  {
    label: 'Business',
    names: ['Layers', 'Gift', 'Briefcase', 'TrendingUp', 'BarChart3', 'CreditCard', 'Banknote', 'ShoppingBag'],
  },
  {
    label: 'Nature',
    names: ['Home', 'Lock', 'Globe', 'Leaf', 'Mountain', 'Flower', 'TreePine', 'Cloud'],
  },
];

/** Default fallback used when a stored icon name is null/invalid/unknown. */
export const CATEGORY_ICON_FALLBACK = LucideIcons.Layers;

/**
 * Build a de-duplicated list of icon definitions `{ name, Icon }` from a
 * list of icon names. The curated groups overlap (an icon can appear in
 * "Popular" and "Objects"), so we normalize into ONE unique collection.
 * `name` is guaranteed unique → safe to use as a React key.
 */
export function deduplicateIcons(names) {
  const seen = new Set();
  const defs = [];
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    const Icon = CATEGORY_ICON_REGISTRY[name];
    if (Icon) defs.push({ name, Icon });
  }
  return defs;
}

// ---------------------------------------------------------------------------
// 3. LEGACY SLUG → ICON ALIASES
// ---------------------------------------------------------------------------
// Quotes store category slugs ("love", "faith", "motivation", ...). When no
// saved icon NAME exists on a category, we resolve the slug to a sensible
// Lucide icon through this alias map (preserves the original pre-registry
// behavior). New categories should store an explicit icon NAME; the alias is
// only a fallback for slugs without one.
export const CATEGORY_SLUG_ICON_ALIASES = {
  inspire: 'Sparkles',
  motivation: 'Sparkles',
  love: 'Heart',
  strength: 'Dumbbell',
  healing: 'Bandage',
  faith: 'Church',
  gratitude: 'HandHeart',
  courage: 'Shield',
  wisdom: 'BookOpen',
  hope: 'Star',
  success: 'Star',
  peace: 'Smile',
  joy: 'Smile',
  happiness: 'Smile',
  family: 'Heart',
  friendship: 'Heart',
  kindness: 'Heart',
  leadership: 'Star',
  mindfulness: 'Sparkles',
  dreams: 'Star',
  life: 'Sparkles',
  discipline: 'Flame',
  purpose: 'Sparkles',
  positivity: 'Smile',
  'self-growth': 'Sparkles',
  general: 'Quote',
  personal: 'Heart',
};

// ---------------------------------------------------------------------------
// 3. RESOLVERS
// ---------------------------------------------------------------------------

/**
 * Resolve a stored icon NAME (or legacy slug) to a Lucide component.
 * Priority:
 *   1. Known icon NAME in the registry (e.g. "Shield").
 *   2. Legacy slug alias (e.g. "love" → Heart).
 *   3. Global fallback (Layers).
 */
export function resolveCategoryIcon(iconNameOrSlug) {
  if (!iconNameOrSlug) return CATEGORY_ICON_FALLBACK;
  const key = String(iconNameOrSlug).trim();
  if (CATEGORY_ICON_REGISTRY[key]) return CATEGORY_ICON_REGISTRY[key];
  const alias = CATEGORY_SLUG_ICON_ALIASES[key.toLowerCase()];
  if (alias && CATEGORY_ICON_REGISTRY[alias]) return CATEGORY_ICON_REGISTRY[alias];
  return CATEGORY_ICON_FALLBACK;
}

/** Whether a stored icon name (or legacy slug) is known/valid. */
export function isKnownCategoryIcon(iconNameOrSlug) {
  if (!iconNameOrSlug) return false;
  const key = String(iconNameOrSlug).trim();
  return (
    Object.prototype.hasOwnProperty.call(CATEGORY_ICON_REGISTRY, key) ||
    Boolean(CATEGORY_SLUG_ICON_ALIASES[key.toLowerCase()])
  );
}

// ---------------------------------------------------------------------------
// 4. CENTRAL CATEGORY RESOLVER — single source of truth
// ---------------------------------------------------------------------------
//
// Merges the backend Category collection (name/slug/icon/color) with the
// shared fallback label + color maps so any slug (even ones missing from the
// Category collection, e.g. "motivation") resolves to ONE canonical shape:
//   { name, slug, icon, color, Icon }
//
// The DB stores a stable icon NAME (e.g. "Shield"); legacy categories may
// store the slug itself (e.g. "love"). resolveCategory handles both:
//   - If `icon` is a known icon NAME → use it.
//   - If `icon` is null/invalid → fall back to the slug's icon (if any),
//     else the global fallback (Layers).
// ---------------------------------------------------------------------------

const DEFAULT_CATEGORY_COLOR = '#6366f1';

/** Map a slug to its canonical display label. */
function resolveCategoryName(slug) {
  if (!slug) return 'Unknown Category';
  return getCategoryLabel(slug);
}

/**
 * Resolve a category (DB doc or quote slug) to its canonical shape.
 * @param {Object|string} category - Category doc, or a slug string.
 * @returns {{
 *   name: string, slug: string|null, icon: string|null,
 *   iconType: 'library'|'custom'|null, iconUrl: string|null,
 *   color: string, Icon: LucideComponent
 * }}
 *
 * Fallback chain (from highest to lowest priority):
 *   custom icon URL (iconType === 'custom' && iconUrl)
 *   → selected library icon name
 *   → legacy icon mapping (slug alias)
 *   → global fallback (Layers)
 */
export function resolveCategory(category) {
  // Accept either a category doc or a raw slug.
  const slug = typeof category === 'string' ? category : category?.slug;
  const iconName = typeof category === 'string' ? null : category?.icon;
  const color = typeof category === 'string' ? null : category?.color;
  const iconType = typeof category === 'string' ? null : category?.iconType || null;
  const iconUrl = typeof category === 'string' ? null : category?.iconUrl || null;

  const isCustom = iconType === 'custom' && Boolean(iconUrl);

  if (!slug && !iconName && !isCustom) {
    return {
      name: 'Unknown Category',
      slug: null,
      icon: null,
      iconType: null,
      iconUrl: null,
      color: DEFAULT_CATEGORY_COLOR,
      Icon: CATEGORY_ICON_FALLBACK,
    };
  }

  // Icon: custom URL wins; else prefer the stored icon NAME; then
  // slug-derived icon; then global fallback. All through
  // resolveCategoryIcon (which also handles legacy slug aliases).
  const Icon = isCustom ? null : resolveCategoryIcon(iconName || slug);

  return {
    name: resolveCategoryName(slug),
    slug: slug || null,
    icon: (isKnownCategoryIcon(iconName) && iconName) || slug || null,
    iconType: iconType || (isCustom ? 'custom' : null),
    iconUrl: isCustom ? iconUrl : null,
    color: color || DEFAULT_CATEGORY_COLOR,
    Icon,
  };
}

/**
 * CategoryIcon — renders the correct icon for a category.
 * - Custom SVG (iconType 'custom' + iconUrl) → <img> (safe; never raw markup).
 * - Library / legacy / fallback → Lucide component.
 *
 * Usage: <CategoryIcon category={doc} size={18} color="#fff" />
 * Accepts a category doc, or a resolved shape from resolveCategory().
 */
export function CategoryIcon({ category, size = 16, color, className = '' }) {
  const resolved = typeof category === 'string' ? resolveCategory(category) : resolveCategory(category || {});
  if (resolved.iconType === 'custom' && resolved.iconUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={resolved.iconUrl} alt="" width={size} height={size} className={`object-contain flex-shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  const Icon = resolved.Icon || CATEGORY_ICON_FALLBACK;
  return <Icon size={size} className={`flex-shrink-0 ${className}`} style={{ color: color || resolved.color || undefined }} />;
}
