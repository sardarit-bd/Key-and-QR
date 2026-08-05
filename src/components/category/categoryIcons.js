'use client';

import {
  Sparkles,
  Heart,
  Dumbbell,
  Bandage,
  Church,
  Shield,
  BookOpen,
  HandHeart,
  Quote,
  Star,
  Flame,
  Smile,
} from 'lucide-react';

/**
 * Central slug → Lucide icon map.
 *
 * Single source of truth for category icons across the app. Keys are
 * category slugs (the same slugs stored on quotes / received by the
 * backend). New categories created through the Category API that are not
 * in this map gracefully fall back to `Sparkles` — no per-page icon
 * constants anywhere.
 */
export const CATEGORY_ICONS = {
  inspire: Sparkles,
  motivation: Sparkles,
  love: Heart,
  strength: Dumbbell,
  healing: Bandage,
  faith: Church,
  gratitude: HandHeart,
  courage: Shield,
  wisdom: BookOpen,
  hope: Star,
  success: Star,
  peace: Smile,
  joy: Smile,
  happiness: Smile,
  family: Heart,
  friendship: Heart,
  kindness: Heart,
  leadership: Star,
  mindfulness: Sparkles,
  dreams: Star,
  life: Sparkles,
  discipline: Flame,
  purpose: Sparkles,
  positivity: Smile,
  'self-growth': Sparkles,
  general: Quote,
  personal: Heart,
};

export const FALLBACK_ICON = Sparkles;

export function getCategoryIcon(slug) {
  if (!slug) return FALLBACK_ICON;
  return CATEGORY_ICONS[String(slug).toLowerCase()] || FALLBACK_ICON;
}
