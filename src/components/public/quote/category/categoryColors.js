'use client';

/**
 * Central slug → color map.
 *
 * Single source of truth for category color theming. The per-category chip
 * theme object is used to build badges/labels in both the dark (Tailwind
 * default) and light (`light:` variants) themes. Every surface (My Quotes,
 * Favorites, Scan History, Submission cards, admin rows) renders chips from
 * these classes, so a new category either matches an existing slug here or
 * falls back to a neutral style.
 */

// Chip theme used by the collectible cards (My Quotes / Favorites / Scan
// History / Overview): border + bg + dark text + light text + glow.
export const CATEGORY_CHIP_THEMES = {
  love: {
    border: 'border-rose-500/35',
    bg: 'bg-rose-500/20',
    text: 'text-rose-300 dark:text-rose-200',
    lightText: 'light:text-rose-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(251,113,133,0.4)]',
  },
  strength: {
    border: 'border-orange-500/35',
    bg: 'bg-orange-500/20',
    text: 'text-orange-300 dark:text-orange-200',
    lightText: 'light:text-orange-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(251,146,60,0.4)]',
  },
  healing: {
    border: 'border-emerald-500/35',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300 dark:text-emerald-200',
    lightText: 'light:text-emerald-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]',
  },
  faith: {
    border: 'border-amber-500/35',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300 dark:text-amber-200',
    lightText: 'light:text-amber-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]',
  },
  gratitude: {
    border: 'border-yellow-500/35',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-300 dark:text-yellow-200',
    lightText: 'light:text-yellow-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(250,204,21,0.4)]',
  },
  inspire: {
    border: 'border-accent/35',
    bg: 'bg-accent/20',
    text: 'text-accent dark:text-amber-200',
    lightText: 'light:text-amber-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(253,182,92,0.35)]',
  },
  hope: {
    border: 'border-teal-500/35',
    bg: 'bg-teal-500/20',
    text: 'text-teal-300 dark:text-teal-200',
    lightText: 'light:text-teal-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(45,212,191,0.4)]',
  },
  success: {
    border: 'border-green-500/35',
    bg: 'bg-green-500/20',
    text: 'text-green-300 dark:text-green-200',
    lightText: 'light:text-green-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(74,222,128,0.4)]',
  },
  leadership: {
    border: 'border-sky-500/35',
    bg: 'bg-sky-500/20',
    text: 'text-sky-300 dark:text-sky-200',
    lightText: 'light:text-sky-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(56,189,248,0.4)]',
  },
  family: {
    border: 'border-pink-500/35',
    bg: 'bg-pink-500/20',
    text: 'text-pink-300 dark:text-pink-200',
    lightText: 'light:text-pink-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(244,114,182,0.4)]',
  },
  friendship: {
    border: 'border-fuchsia-500/35',
    bg: 'bg-fuchsia-500/20',
    text: 'text-fuchsia-300 dark:text-fuchsia-200',
    lightText: 'light:text-fuchsia-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(232,121,249,0.4)]',
  },
  kindness: {
    border: 'border-violet-500/35',
    bg: 'bg-violet-500/20',
    text: 'text-violet-300 dark:text-violet-200',
    lightText: 'light:text-violet-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(167,139,250,0.4)]',
  },
  happiness: {
    border: 'border-yellow-400/35',
    bg: 'bg-yellow-400/20',
    text: 'text-yellow-300 dark:text-yellow-200',
    lightText: 'light:text-yellow-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(250,204,21,0.4)]',
  },
  wisdom: {
    border: 'border-indigo-500/35',
    bg: 'bg-indigo-500/20',
    text: 'text-indigo-300 dark:text-indigo-200',
    lightText: 'light:text-indigo-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(129,140,248,0.4)]',
  },
  motivation: {
    border: 'border-orange-400/35',
    bg: 'bg-orange-400/20',
    text: 'text-orange-300 dark:text-orange-200',
    lightText: 'light:text-orange-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(251,146,60,0.4)]',
  },
  'self-growth': {
    border: 'border-cyan-500/35',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300 dark:text-cyan-200',
    lightText: 'light:text-cyan-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(34,211,238,0.4)]',
  },
  positivity: {
    border: 'border-lime-500/35',
    bg: 'bg-lime-500/20',
    text: 'text-lime-300 dark:text-lime-200',
    lightText: 'light:text-lime-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(163,230,53,0.4)]',
  },
  courage: {
    border: 'border-red-500/35',
    bg: 'bg-red-500/20',
    text: 'text-red-300 dark:text-red-200',
    lightText: 'light:text-red-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(248,113,113,0.4)]',
  },
  mindfulness: {
    border: 'border-teal-400/35',
    bg: 'bg-teal-400/20',
    text: 'text-teal-300 dark:text-teal-200',
    lightText: 'light:text-teal-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(45,212,191,0.4)]',
  },
  dreams: {
    border: 'border-purple-500/35',
    bg: 'bg-purple-500/20',
    text: 'text-purple-300 dark:text-purple-200',
    lightText: 'light:text-purple-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(192,132,252,0.4)]',
  },
  life: {
    border: 'border-emerald-400/35',
    bg: 'bg-emerald-400/20',
    text: 'text-emerald-300 dark:text-emerald-200',
    lightText: 'light:text-emerald-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(52,211,153,0.4)]',
  },
  peace: {
    border: 'border-blue-500/35',
    bg: 'bg-blue-500/20',
    text: 'text-blue-300 dark:text-blue-200',
    lightText: 'light:text-blue-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(96,165,250,0.4)]',
  },
  discipline: {
    border: 'border-stone-500/35',
    bg: 'bg-stone-500/20',
    text: 'text-stone-300 dark:text-stone-200',
    lightText: 'light:text-stone-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(168,162,158,0.4)]',
  },
  purpose: {
    border: 'border-amber-400/35',
    bg: 'bg-amber-400/20',
    text: 'text-amber-300 dark:text-amber-200',
    lightText: 'light:text-amber-800',
    glow: 'shadow-[0_0_16px_-4px_rgba(251,191,36,0.4)]',
  },
  random: {
    border: 'border-white/15',
    bg: 'bg-white/10',
    text: 'text-foreground-secondary',
    lightText: 'light:text-[#4A3C2D]',
    glow: '',
  },
};

export const FALLBACK_CHIP_THEME = {
  border: 'border-white/15',
  bg: 'bg-white/10',
  text: 'text-foreground-secondary',
  lightText: 'light:text-[#4A3C2D]',
  glow: '',
};

export function getCategoryChipTheme(slug) {
  if (!slug) return FALLBACK_CHIP_THEME;
  return CATEGORY_CHIP_THEMES[String(slug).toLowerCase()] || FALLBACK_CHIP_THEME;
}

// Compact chip class used by badges in admin/table rows (indigo-tinted by
// default in the old code; we keep a per-slug tint when known, else neutral).
export const CATEGORY_BADGE_CLASSES = {
  love: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
  strength: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
  healing: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  faith: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  gratitude: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
  inspire: 'border-accent/20 bg-accent/10 text-accent',
  motivation: 'border-orange-400/20 bg-orange-400/10 text-orange-400',
  hope: 'border-teal-500/20 bg-teal-500/10 text-teal-400',
  success: 'border-green-500/20 bg-green-500/10 text-green-400',
};

export const FALLBACK_BADGE_CLASS =
  'border-indigo-500/20 bg-indigo-500/10 text-indigo-400';

export function getCategoryBadgeClass(slug) {
  if (!slug) return FALLBACK_BADGE_CLASS;
  return CATEGORY_BADGE_CLASSES[String(slug).toLowerCase()] || FALLBACK_BADGE_CLASS;
}
