'use client';

/**
 * Central slug → display label map.
 *
 * Single source of truth for category display names. When a quote references
 * a category slug, its human label resolves here. The backend Category
 * collection is the source of truth for name; this map is only a fallback
 * for slugs the backend has not yet seeded (so the UI never shows a raw
 * slug), and mirrors the prettified names used by the public scan flows
 * (e.g. "Love ♥", "Faith ☾").
 */

export const CATEGORY_LABELS = {
  love: 'Love',
  strength: 'Strength',
  healing: 'Healing',
  faith: 'Faith',
  gratitude: 'Gratitude',
  inspire: 'Inspire',
  motivation: 'Motivation',
  hope: 'Hope',
  success: 'Success',
  leadership: 'Leadership',
  family: 'Family',
  friendship: 'Friendship',
  kindness: 'Kindness',
  happiness: 'Happiness',
  wisdom: 'Wisdom',
  'self-growth': 'Self Growth',
  positivity: 'Positivity',
  courage: 'Courage',
  mindfulness: 'Mindfulness',
  dreams: 'Dreams',
  life: 'Life',
  peace: 'Peace',
  discipline: 'Discipline',
  purpose: 'Purpose',
  other: 'Other',
  random: 'Random',
  general: 'General',
  personal: 'Personal',
};

export const PRETTY_CATEGORY_LABELS = {
  ...CATEGORY_LABELS,
  love: 'Love ♥',
  strength: 'Strength ◐',
  healing: 'Healing ✦',
  faith: 'Faith ☾',
  gratitude: 'Gratitude ☀',
  personal: 'Personal ♥',
};

export function getCategoryLabel(slug) {
  if (!slug) return 'Inspiration';
  const key = String(slug).toLowerCase();
  return CATEGORY_LABELS[key] || prettifySlug(slug);
}

export function getPrettyCategoryLabel(slug) {
  if (!slug) return 'Inspiration';
  const key = String(slug).toLowerCase();
  return PRETTY_CATEGORY_LABELS[key] || prettifySlug(slug);
}

function prettifySlug(slug) {
  return String(slug)
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
